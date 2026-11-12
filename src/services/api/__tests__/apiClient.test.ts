/**
 * @jest-environment node
 */
import { apiClient } from '@/services/api/apiClient';

const mockClearAuth = jest.fn();
let mockToken: string | null = 'token-valido';

jest.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }),
}));

const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

jest.mock('@/services/cookieService', () => ({
  cookieService: {
    getAuthToken: async () => mockToken,
    clearAuth: () => mockClearAuth(),
  },
}));

function mockFetchOnce(body: string, init: ResponseInit) {
  const fetchMock = jest.fn().mockResolvedValue(new Response(body, init));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token-valido';
  });

  it('não trata como erro um sucesso com corpo em texto puro (causa do bug do cadastro)', async () => {
    mockFetchOnce('Paciente cadastrado com sucesso!', { status: 201 });

    const result = await apiClient.post('/auth/register/patient', {}, { public: true });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(201);
  });

  it('faz parse de JSON no sucesso', async () => {
    mockFetchOnce(JSON.stringify({ message: 'ok', nextStep: 'LOGIN' }), { status: 201 });
    const result = await apiClient.post<{ message: string }>('/x', {}, { public: true });
    expect(result.data).toEqual({ message: 'ok', nextStep: 'LOGIN' });
  });

  it('devolve mensagem, código e erros por campo do backend', async () => {
    mockFetchOnce(
      JSON.stringify({ status: 409, message: 'Este e-mail já está cadastrado.', errors: { email: 'Este e-mail já está cadastrado.' } }),
      { status: 409 }
    );

    const result = await apiClient.post('/auth/register/patient', {}, { public: true });

    expect(result.status).toBe(409);
    expect(result.error).toBe('Este e-mail já está cadastrado.');
    expect(result.fieldErrors).toEqual({ email: 'Este e-mail já está cadastrado.' });
  });

  it('trata 429 com Retry-After e mensagem amigável', async () => {
    mockFetchOnce(
      JSON.stringify({ status: 429, code: 'RATE_LIMITED', message: 'Muitas tentativas em pouco tempo. Aguarde 2 minutos e tente novamente.' }),
      { status: 429, headers: { 'Retry-After': '120' } }
    );

    const result = await apiClient.post('/auth/login', {}, { public: true });

    expect(result.code).toBe('RATE_LIMITED');
    expect(result.retryAfter).toBe(120);
    expect(result.error).toContain('Aguarde');
  });

  it('usa mensagem padrão quando o corpo de erro não é JSON', async () => {
    mockFetchOnce('<html>Bad gateway</html>', { status: 429 });
    const result = await apiClient.get('/qualquer', { public: true });
    expect(result.error).toBe('Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.');
  });

  it('repassa o IP do navegador e o token', async () => {
    const fetchMock = mockFetchOnce('', { status: 200 });
    await apiClient.get('/notifications');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Forwarded-For']).toBe('203.0.113.9');
    expect(init.headers['Authorization']).toBe('Bearer token-valido');
  });

  it('limpa a sessão local quando o backend responde 401 em rota autenticada', async () => {
    mockFetchOnce(JSON.stringify({ status: 401, code: 'UNAUTHENTICATED', message: 'Sessão expirada' }), { status: 401 });
    await apiClient.get('/notifications');
    expect(mockClearAuth).toHaveBeenCalled();
  });

  it('redireciona para a troca de senha quando o backend exige', async () => {
    mockFetchOnce(JSON.stringify({ status: 403, code: 'PASSWORD_CHANGE_REQUIRED', message: 'Troque a senha' }), { status: 403 });
    await apiClient.get('/admin/users');
    expect(mockRedirect).toHaveBeenCalledWith('/change-password?obrigatoria=1');
  });

  it('não chama a API sem token em rota autenticada', async () => {
    mockToken = null;
    const fetchMock = mockFetchOnce('', { status: 200 });
    const result = await apiClient.get('/notifications');
    expect(result.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
