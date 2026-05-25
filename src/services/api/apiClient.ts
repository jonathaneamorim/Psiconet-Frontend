import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';

// ─── Tipos internos ───────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  /** Dados enviados no body da requisição (serializado automaticamente como JSON) */
  body?: unknown;
  /** Sobrescreve o cache padrão (`no-store`) */
  cache?: RequestCache;
  /** A requisição não precisa de autenticação (ex: login, register) */
  public?: boolean;
}

/** Resultado padronizado de todas as chamadas ao apiClient */
export interface ApiResult<T = void> {
  data?: T;
  error?: string;
  status?: number;
}

// ─── Mensagens de erro padrão ─────────────────────────────────────────────────

const HTTP_ERRORS: Record<number, string> = {
  400: 'Dados inválidos.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: o estado atual não permite esta operação.',
  500: 'Erro interno no servidor. Tente novamente.',
};

function getHttpErrorMessage(status: number, fallback: string): string {
  return HTTP_ERRORS[status] ?? fallback;
}

// ─── Cliente HTTP centralizado ────────────────────────────────────────────────

/**
 * Cliente HTTP centralizado para Server Actions.
 *
 * - Injeta o Bearer token automaticamente (salvo quando `public: true`)
 * - Define `Content-Type: application/json` por padrão
 * - Define `cache: 'no-store'` por padrão
 * - Serializa o body automaticamente
 * - Retorna `{ data }` em caso de sucesso ou `{ error, status }` em caso de falha
 */
async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!options.public) {
    const token = await cookieService.getAuthToken();
    if (!token) return { error: 'Não autenticado.', status: 401 };
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? 'no-store',
    });

    if (!response.ok) {
      let errorMessage = getHttpErrorMessage(response.status, 'Erro na requisição.');
      try {
        const errorBody = await response.json();
        if (errorBody?.message) errorMessage = errorBody.message;
      } catch {
        // Resposta sem body JSON — usa mensagem padrão
      }
      return { error: errorMessage, status: response.status };
    }

    // Respostas sem body (ex: 204 No Content)
    const text = await response.text();
    if (!text) return {} as ApiResult<T>;

    const data = JSON.parse(text) as T;
    return { data };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

// ─── Métodos exportados ───────────────────────────────────────────────────────

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
};
