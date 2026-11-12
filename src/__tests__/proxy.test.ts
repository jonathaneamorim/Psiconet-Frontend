/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

function jwt(payload: object) {
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${enc({ alg: 'HS256' })}.${enc(payload)}.assinatura`;
}
const inSeconds = (s: number) => Math.floor(Date.now() / 1000) + s;
const valid = jwt({ role: 'PATIENT', sub: 'p@x.com', exp: inSeconds(600) });
const expired = jwt({ role: 'PATIENT', sub: 'p@x.com', exp: inSeconds(-10) });

function request(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: { 'user-agent': 'Jest', 'x-forwarded-for': '203.0.113.9' },
  });
  Object.entries(cookies).forEach(([k, v]) => req.cookies.set(k, v));
  return req;
}

const fetchMock = jest.fn();
beforeAll(() => { global.fetch = fetchMock as unknown as typeof fetch; });
beforeEach(() => fetchMock.mockReset());

describe('proxy — sessão e rotas', () => {
  it('documentos legais abrem logado e deslogado (sem redirecionar ao dashboard)', async () => {
    for (const path of ['/terms', '/privacy', '/cookies']) {
      expect((await proxy(request(path))).headers.get('location')).toBeNull();
      expect((await proxy(request(path, { psiconet_token: valid }))).headers.get('location')).toBeNull();
    }
  });

  it('páginas públicas seguem levando o usuário logado ao dashboard', async () => {
    const res = await proxy(request('/login', { psiconet_token: valid }));
    expect(res.headers.get('location')).toBe('http://localhost:3000/patient/dashboard');
  });

  it('token vencido + refresh: renova de forma transparente e grava os cookies novos', async () => {
    const renewed = jwt({ role: 'PATIENT', sub: 'p@x.com', exp: inSeconds(900) });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      token: renewed, expiresAt: new Date(Date.now() + 900_000).toISOString(),
      refreshToken: 'sessao.novo', refreshExpiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      rememberMe: true, role: 'PATIENT', mustChangePassword: false, consentRequired: false,
    }), { status: 200 }));

    const res = await proxy(request('/patient/dashboard', { psiconet_token: expired, psiconet_refresh: 'sessao.velho' }));

    expect(res.headers.get('location')).toBeNull();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/refresh$/);
    expect(JSON.parse(init.body)).toEqual({ refreshToken: 'sessao.velho' });
    expect(init.headers['X-Forwarded-For']).toBe('203.0.113.9');
    expect(init.headers['X-Client-User-Agent']).toBe('Jest');
    expect(res.cookies.get('psiconet_token')?.value).toBe(renewed);
    expect(res.cookies.get('psiconet_refresh')?.value).toBe('sessao.novo');
    // A própria requisição já segue com o token novo
    expect(res.headers.get('x-middleware-request-cookie') ?? res.headers.get('x-middleware-override-headers')).toBeTruthy();
  });

  it('refresh recusado pelo backend: limpa os cookies e leva ao login com aviso', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: 'SESSION_EXPIRED' }), { status: 401 }));

    const res = await proxy(request('/patient/appointments', { psiconet_token: expired, psiconet_refresh: 'sessao.revogada' }));

    expect(res.headers.get('location')).toBe('http://localhost:3000/login?sessao=expirada');
    expect(res.cookies.get('psiconet_token')?.value).toBe('');
    expect(res.cookies.get('psiconet_refresh')?.value).toBe('');
  });

  it('token válido não chama o refresh', async () => {
    await proxy(request('/patient/dashboard', { psiconet_token: valid, psiconet_refresh: 'sessao.x' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('token vencido sem refresh: login com aviso de sessão expirada', async () => {
    const res = await proxy(request('/patient/dashboard', { psiconet_token: expired }));
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?sessao=expirada');
  });

  it('/login?sessao=expirada sempre limpa a sessão (evita laço login ↔ dashboard)', async () => {
    const res = await proxy(request('/login?sessao=expirada', { psiconet_token: valid, psiconet_refresh: 'x' }));
    expect(res.headers.get('location')).toBeNull();
    expect(res.cookies.get('psiconet_token')?.value).toBe('');
  });

  it('tela de aceite é compartilhada por qualquer papel autenticado', async () => {
    const admin = jwt({ role: 'ADMIN', sub: 'a@x.com', exp: inSeconds(600) });
    expect((await proxy(request('/accept-terms', { psiconet_token: admin }))).headers.get('location')).toBeNull();
    expect((await proxy(request('/accept-terms'))).headers.get('location')).toBe('http://localhost:3000/login');
  });
});
