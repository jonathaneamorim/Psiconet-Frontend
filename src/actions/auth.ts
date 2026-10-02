'use server';

import { apiClient } from '@/services/api/apiClient';
import { cookieService } from '@/services/cookieService';
import { decodeRoleFromToken } from '@/lib/jwt';
import { ROUTES } from '@/config/routes';
import type { ActionResult, AuthResponse } from '@/types/auth';

export async function loginAction(formData: FormData, keepLoggedIn: boolean): Promise<ActionResult> {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const result = await apiClient.post<AuthResponse>(
    '/auth/login',
    { email, password, rememberMe: keepLoggedIn },
    { public: true }
  );

  if (result.error || !result.data) {
    return { error: result.error ?? 'Não foi possível fazer login.', code: result.code };
  }

  const userRole = decodeRoleFromToken(result.data.token);
  if (!userRole) {
    return { error: 'Token inválido recebido do servidor.' };
  }

  await cookieService.setAuthToken(result.data.token, keepLoggedIn, result.data.expiresAt);

  // Senha temporária (ex.: administrador recém-criado): o backend bloqueia as demais rotas até a troca.
  if (result.data.mustChangePassword) {
    return { success: true, redirectTo: `${ROUTES.CHANGE_PASSWORD}?obrigatoria=1` };
  }
  return { success: true, redirectTo: `/${userRole}/dashboard` };
}

/* Troca de senha do usuário logado (inclui a troca obrigatória do primeiro acesso) */
export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const currentPassword = formData.get('currentPassword')?.toString() ?? '';
  const newPassword = formData.get('newPassword')?.toString() ?? '';
  const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

  if (newPassword !== confirmPassword) {
    return { error: 'As senhas não coincidem.', fields: { confirmPassword: 'As senhas não coincidem.' } };
  }

  const result = await apiClient.post<AuthResponse>('/auth/change-password', { currentPassword, newPassword });
  if (result.error || !result.data) {
    return { error: result.error ?? 'Não foi possível alterar a senha.', fields: result.fieldErrors };
  }

  // O backend invalida os tokens antigos e devolve um novo para a sessão atual
  await cookieService.setAuthToken(result.data.token, false, result.data.expiresAt);
  const role = decodeRoleFromToken(result.data.token);
  return { success: true, redirectTo: role ? `/${role}/dashboard` : ROUTES.LOGIN };
}

/* Solicita o envio do link de redefinição de senha por e-mail (POST /auth/forgot-password) */
export async function forgotPasswordAction(email: string): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.post('/auth/forgot-password', { email }, { public: true });
  return result.error ? { error: result.error } : { success: true };
}

/* Verifica se o link de redefinição (token) ainda é válido antes de exibir
   a tela de troca de senha (POST /auth/reset-password/validate) */
export async function validateResetTokenAction(
  token: string
): Promise<{ valid: boolean; error?: string }> {
  const result = await apiClient.post('/auth/reset-password/validate', { token }, { public: true });
  return result.error ? { valid: false, error: result.error } : { valid: true };
}

/* Confirma o token de redefinição e define a nova senha (POST /auth/reset-password) */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.post('/auth/reset-password', { token, newPassword }, { public: true });
  if (result.error) {
    return { error: result.fieldErrors?.newPassword ?? result.error };
  }
  return { success: true };
}
