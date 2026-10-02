export type BackendRole = 'ADMIN' | 'PSYCHOLOGIST' | 'PATIENT';

/** Resposta de POST /auth/login e POST /auth/change-password */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  role: BackendRole;
  mustChangePassword: boolean;
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
