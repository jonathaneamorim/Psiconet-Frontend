'use server';

import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';
import { decodeRoleFromToken } from '@/lib/jwt';
import type { AuthResponse } from '@/types/auth';

export async function loginAction(formData: FormData, keepLoggedIn: boolean) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString().trim();

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { error: errorData?.message || 'Credenciais inválidas ou usuário não encontrado.' };
    }

    const data: AuthResponse = await response.json();
    const userRole = decodeRoleFromToken(data.token);

    if (!userRole) {
      return { error: 'Token inválido recebido do servidor.' };
    }

    await cookieService.setAuthToken(data.token, keepLoggedIn);
    return { success: true, redirectTo: `/${userRole}/dashboard` };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

/* Solicita o envio do código de redefinição de senha por e-mail (POST /auth/forgot-password) */
export async function forgotPasswordAction(email: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { error: errorData?.message || 'Não foi possível processar a solicitação.' };
    }

    return { success: true };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

/* Verifica se o link de redefinição (token) ainda é válido antes de exibir
   a tela de troca de senha (POST /auth/reset-password/validate) */
export async function validateResetTokenAction(
  token: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { valid: false, error: errorData?.message || 'Link inválido ou expirado.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Erro de conexão com o servidor.' };
  }
}

/* Confirma o token de redefinição e define a nova senha (POST /auth/reset-password) */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { error: errorData?.message || 'Link inválido ou expirado.' };
    }

    return { success: true };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}