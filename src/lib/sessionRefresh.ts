import { API_URL } from '@/constants/api';
import type { AuthResponse } from '@/types/auth';

/**
 * Renova a sessão no backend (POST /auth/refresh). Usada pelo proxy.ts — único ponto, junto das
 * Server Actions, em que o Next permite gravar cookies. Repassa IP e navegador do usuário
 * (o backend só aceita esses cabeçalhos vindos de proxy confiável).
 *
 * @returns a nova sessão, `null` se o backend recusou (sessão expirada/revogada) ou `undefined`
 *          se o backend não respondeu (não derruba a sessão por uma falha de rede).
 */
export async function refreshSession(
  refreshToken: string,
  forwarded: { ip?: string | null; userAgent?: string | null } = {}
): Promise<AuthResponse | null | undefined> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (forwarded.ip) headers['X-Forwarded-For'] = forwarded.ip;
  if (forwarded.userAgent) headers['X-Client-User-Agent'] = forwarded.userAgent.slice(0, 512);

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 400) return null;
    if (!response.ok) return undefined;
    return (await response.json()) as AuthResponse;
  } catch {
    return undefined;
  }
}
