import { COOKIE_REFRESH, COOKIE_TOKEN } from '@/constants/cookies';
import type { AuthResponse } from '@/types/auth';

/*
 * Cookies de sessão a partir da resposta da API — funções puras, usadas pelas Server Actions
 * (cookieService) e pelo proxy.ts. As durações vêm SEMPRE do backend (ADR 014): o front não tem
 * tempos próprios. Sem "manter conectado", os cookies não têm maxAge (somem ao fechar o navegador).
 */

export interface SessionCookie {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax';
    path: '/';
    maxAge?: number;
  };
}

function secondsUntil(iso: string | null | undefined, nowMs: number): number | undefined {
  if (!iso) return undefined;
  const seconds = Math.floor((new Date(iso).getTime() - nowMs) / 1000);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function cookie(name: string, value: string, maxAge?: number): SessionCookie {
  return {
    name,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(maxAge !== undefined && { maxAge }),
    },
  };
}

export function buildSessionCookies(auth: AuthResponse, nowMs: number = Date.now()): SessionCookie[] {
  const persistent = auth.rememberMe;
  const cookies = [cookie(COOKIE_TOKEN, auth.token, persistent ? secondsUntil(auth.expiresAt, nowMs) : undefined)];
  if (auth.refreshToken) {
    cookies.push(cookie(COOKIE_REFRESH, auth.refreshToken, persistent ? secondsUntil(auth.refreshExpiresAt, nowMs) : undefined));
  }
  return cookies;
}

export const SESSION_COOKIE_NAMES = [COOKIE_TOKEN, COOKIE_REFRESH] as const;

/** Parâmetro de /login que indica sessão encerrada pelo servidor (mostra aviso e limpa cookies). */
export const SESSION_EXPIRED_PARAM = 'sessao';
export const SESSION_EXPIRED_VALUE = 'expirada';
export const SESSION_EXPIRED_LOGIN_PATH = `/login?${SESSION_EXPIRED_PARAM}=${SESSION_EXPIRED_VALUE}`;
