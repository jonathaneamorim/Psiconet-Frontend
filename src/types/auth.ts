export type BackendRole = 'ADMIN' | 'PSYCHOLOGIST' | 'PATIENT';

/**
 * Resposta de POST /auth/login, /auth/refresh e /auth/change-password.
 * `refreshToken` nulo = manter o cookie de refresh atual (renovação paralela).
 * Sem `rememberMe`, os dois cookies são de sessão do navegador.
 */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  refreshToken: string | null;
  refreshExpiresAt: string;
  rememberMe: boolean;
  role: BackendRole;
  mustChangePassword: boolean;
  consentRequired: boolean;
}

export interface JwtPayload { role: string; sub: string; exp?: number; }

/** Retorno padronizado das Server Actions de formulário */
export interface ActionResult {
  success?: boolean;
  redirectTo?: string;
  error?: string;
  code?: string;
  fields?: Record<string, string>;
  message?: string;
}
