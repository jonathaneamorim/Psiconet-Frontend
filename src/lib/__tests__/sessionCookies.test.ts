import { buildSessionCookies } from '@/lib/sessionCookies';
import type { AuthResponse } from '@/types/auth';

const now = Date.parse('2026-10-02T12:00:00Z');
const base: AuthResponse = {
  token: 'acesso',
  expiresAt: '2026-10-02T12:15:00Z',
  refreshToken: 'sessao.segredo',
  refreshExpiresAt: '2026-10-09T12:00:00Z',
  rememberMe: true,
  role: 'PATIENT',
  mustChangePassword: false,
  consentRequired: false,
};

describe('buildSessionCookies', () => {
  it('"manter conectado": cookies persistentes com as expirações da API', () => {
    const [access, refresh] = buildSessionCookies(base, now);
    expect(access).toMatchObject({ name: 'psiconet_token', value: 'acesso', options: { maxAge: 900, httpOnly: true, sameSite: 'lax' } });
    expect(refresh).toMatchObject({ name: 'psiconet_refresh', value: 'sessao.segredo', options: { maxAge: 7 * 24 * 3600 } });
  });

  it('sem "manter conectado": cookies de sessão do navegador (sem maxAge)', () => {
    const cookies = buildSessionCookies({ ...base, rememberMe: false }, now);
    expect(cookies).toHaveLength(2);
    cookies.forEach((c) => expect(c.options.maxAge).toBeUndefined());
  });

  it('renovação paralela (refresh nulo) não mexe no cookie de refresh', () => {
    const cookies = buildSessionCookies({ ...base, refreshToken: null }, now);
    expect(cookies.map((c) => c.name)).toEqual(['psiconet_token']);
  });
});
