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