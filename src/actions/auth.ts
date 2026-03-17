"use server";

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { COOKIE_TOKEN, ROLE_PREFIX } from '@/constants/cookies';
import type { AuthResponse, JwtPayload } from '@/types/auth';

export async function loginAction(
  formData: FormData,
  keepLoggedIn: boolean
) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString().trim();

  const tempoExpiracao = keepLoggedIn
    ? 24 * 60 * 60 * (Number(process.env.KEEP_LOGGED_TIME) || 30)
    : 60 * (Number(process.env.ACCESS_TIME) || 60);

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: 'Credenciais inválidas ou usuário não encontrado.' };
    }

    const data: AuthResponse = await response.json();

    // Decodifica e limpa a role (ex: ROLE_PSYCHOLOGIST → psychologist)
    const decoded = jwtDecode<JwtPayload>(data.token);
    const userRoleFromToken = decoded.role.replace(ROLE_PREFIX, '').toLowerCase();

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_TOKEN, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tempoExpiracao,
    });

    return { success: true, redirectTo: `/${userRoleFromToken}/dashboard` };

  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    return { error: 'Erro de conexão com o servidor.' };
  }
}