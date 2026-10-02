import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';
import { SESSION_EXPIRED_LOGIN_PATH } from '@/lib/sessionCookies';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  cache?: RequestCache;
  public?: boolean;
  /**
   * Chamada em segundo plano (polling do sino, dados da navbar no layout): nunca redireciona —
   * nem para a troca de senha, nem para o aceite de termos, nem para o login com sessão expirada.
   */
  background?: boolean;
}

export interface ApiResult<T = void> {
  data?: T;
  error?: string;
  status?: number;
  /** Código estável enviado pelo backend (ex.: RATE_LIMITED, PASSWORD_CHANGE_REQUIRED, ACCOUNT_INACTIVE). */
  code?: string;
  /** Erros por campo (`ErrorResponse.errors` do backend), para exibir junto de cada input. */
  fieldErrors?: Record<string, string>;
  /** Segundos até poder tentar de novo (cabeçalho Retry-After em respostas 429). */
  retryAfter?: number;
}

interface BackendErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
}

const HTTP_ERRORS: Record<number, string> = {
  400: 'Dados inválidos.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: o estado atual não permite esta operação.',
  429: 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.',
  500: 'Erro interno no servidor. Tente novamente.',
};

function getHttpErrorMessage(status: number, fallback: string): string {
  return HTTP_ERRORS[status] ?? fallback;
}

/** Lê o corpo como JSON quando possível; corpos vazios ou texto puro não quebram a chamada. */
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * IP do navegador, repassado ao backend em X-Forwarded-For. Como as chamadas saem do servidor
 * Next, sem isso o backend veria sempre o IP do próprio servidor e o rate limit por IP seria
 * compartilhado por todos os usuários. O backend só confia nesse cabeçalho vindo de proxy confiável.
 */
async function clientIp(): Promise<string | null> {
  try {
    const incoming = await headers();
    const forwarded = incoming.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwarded || incoming.get('x-real-ip') || null;
  } catch {
    return null;
  }
}

/**
 * Navegador do usuário, repassado em X-Client-User-Agent (prova de aceite e sessões guardam só um
 * resumo, ex.: "Chrome 141 · Windows"). Como o X-Forwarded-For, só é aceito de proxy confiável.
 */
async function clientUserAgent(): Promise<string | null> {
  try {
    return (await headers()).get('user-agent')?.slice(0, 512) ?? null;
  } catch {
    return null;
  }
}

/** Sessão inválida no backend (usuário inativado, logout em outro dispositivo, token expirado). */
async function clearInvalidSession() {
  try {
    await cookieService.clearAuth();
  } catch {
    // Em Server Components não é possível alterar cookies; o proxy redireciona na próxima navegação.
  }
}

async function toErrorResult<T>(response: Response, isPublic: boolean): Promise<ApiResult<T>> {
  const body = (await readBody(response)) as BackendErrorBody | string | undefined;
  const parsed = typeof body === 'object' && body !== null ? body : undefined;

  const result: ApiResult<T> = {
    error: parsed?.message || getHttpErrorMessage(response.status, 'Erro na requisição.'),
    status: response.status,
    code: parsed?.code,
    fieldErrors: parsed?.errors ?? undefined,
  };

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) result.retryAfter = retryAfter;
  }

  if (response.status === 401 && !isPublic) {
    await clearInvalidSession();
  }

  return result;
}

const PASSWORD_CHANGE_PATH = '/change-password?obrigatoria=1';
const ACCEPT_TERMS_PATH = '/accept-terms';

async function send<T>(
  method: HttpMethod,
  path: string,
  init: { body?: BodyInit; json?: boolean; cache?: RequestCache; public?: boolean; background?: boolean }
): Promise<ApiResult<T>> {
  const result = await sendRaw<T>(method, path, init);
  // Fora do try/catch de propósito, pois redirect() funciona lançando uma exceção de controle do Next.
  if (!init.background) {
    // Senha temporária pendente: o backend bloqueia tudo até a troca.
    if (result.code === 'PASSWORD_CHANGE_REQUIRED') redirect(PASSWORD_CHANGE_PATH);
    // Termos/Privacidade novos ou nunca aceitos: o backend bloqueia tudo até o aceite (ADR 013).
    if (result.code === 'CONSENT_REQUIRED') redirect(ACCEPT_TERMS_PATH);
    // Sessão recusada pelo backend (expirada, revogada, conta inativada): login com aviso.
    if (result.status === 401 && !init.public) redirect(SESSION_EXPIRED_LOGIN_PATH);
  }
  return result;
}

async function sendRaw<T>(
  method: HttpMethod,
  path: string,
  init: { body?: BodyInit; json?: boolean; cache?: RequestCache; public?: boolean }
): Promise<ApiResult<T>> {
  const requestHeaders: Record<string, string> = {};
  if (init.json) requestHeaders['Content-Type'] = 'application/json';

  if (!init.public) {
    const token = await cookieService.getAuthToken();
    if (!token) return { error: 'Não autenticado.', status: 401 };
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const ip = await clientIp();
  if (ip) requestHeaders['X-Forwarded-For'] = ip;
  const userAgent = await clientUserAgent();
  if (userAgent) requestHeaders['X-Client-User-Agent'] = userAgent;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: init.body,
      cache: init.cache ?? 'no-store',
    });

    if (!response.ok) {
      return toErrorResult<T>(response, Boolean(init.public));
    }

    const data = await readBody(response);
    return data === undefined ? ({} as ApiResult<T>) : { data: data as T, status: response.status };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

/*
 * Injeta o Bearer token automaticamente (salvo quando `public: true`)
 * Define `Content-Type: application/json` por padrão e `cache: 'no-store'`
 * Repassa o IP do navegador (X-Forwarded-For) para o rate limit do backend
 * Retorna `{ data }` em caso de sucesso ou `{ error, status, code, fieldErrors, retryAfter }` em falha
 */
async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  return send<T>(method, path, {
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    json: true,
    cache: options.cache,
    public: options.public,
    background: options.background,
  });
}

interface FormRequestOptions {
  cache?: RequestCache;
  public?: boolean;
}

/*
 * Envia FormData (multipart/form-data) sem forçar Content-Type: application/json.
 * Necessário para uploads de arquivo (ex: comprovante de pagamento).
 */
async function requestForm<T>(
  method: 'POST' | 'PUT' | 'PATCH',
  path: string,
  formData: FormData,
  options: FormRequestOptions = {}
): Promise<ApiResult<T>> {
  return send<T>(method, path, { body: formData, cache: options.cache, public: options.public });
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, opts),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),

  postForm: <T>(path: string, formData: FormData, opts?: FormRequestOptions) =>
    requestForm<T>('POST', path, formData, opts),
};
