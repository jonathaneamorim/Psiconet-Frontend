import { cookies } from 'next/headers';
import { COOKIE_TOKEN } from '@/constants/cookies';
import { ACCESS_TIME_MINUTES, KEEP_LOGGED_TIME_DAYS } from '@/constants/auth';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// opções padrão de segurança
const DEFAULT_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const cookieService = {
  // metodos base
  async get(name: string): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value ?? null;
  },

  async set(name: string, value: string, options?: Partial<ResponseCookie>): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(name, value, { ...DEFAULT_OPTIONS, ...options });
  },

  async remove(name: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  },

  async exists(name: string): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.has(name);
  },

  // auth cookies
  async getAuthToken(): Promise<string | null> {
    return this.get(COOKIE_TOKEN);
  },

  async setAuthToken(token: string, remember: boolean = false): Promise<void> {
    const maxAgeSeconds = remember
      ? 24 * 60 * 60 * KEEP_LOGGED_TIME_DAYS
      : 60 * ACCESS_TIME_MINUTES;

    await this.set(COOKIE_TOKEN, token, {
      maxAge: maxAgeSeconds,
    });
  },

  async clearAuth(): Promise<void> {
    await this.remove(COOKIE_TOKEN);
  },
};
