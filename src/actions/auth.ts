"use server";

import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/constants/api';
import { ROLE_PREFIX } from '@/constants/cookies';
import { cookieService } from '@/services/cookieService';
import type { AuthResponse, JwtPayload } from '@/types/auth';

export async function loginAction(
  formData: FormData,
  keepLoggedIn: boolean
) {
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
      return {
        error: errorData?.message || 'Credenciais inválidas ou usuário não encontrado.',
      };
    }

    const data: AuthResponse = await response.json();
    const decoded = jwtDecode<JwtPayload>(data.token);
    const userRoleFromToken = decoded.role.replace(ROLE_PREFIX, '').toLowerCase();

    await cookieService.setAuthToken(data.token, keepLoggedIn);

    return { success: true, redirectTo: `/${userRoleFromToken}/dashboard` };

  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    return { error: 'Erro de conexão com o servidor.' };
  }
}