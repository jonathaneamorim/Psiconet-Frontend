"use server";

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  token: string;
}

interface JwtPayload {
  role: string; 
  sub: string;
}

export async function loginAction(
  formData: FormData, 
  keepLoggedIn: boolean
) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString().trim();

  const tempoExpiracao = keepLoggedIn 
    ? 24 * 60 * 60 * (Number(process.env.KEEP_LOGGED_TIME) || 30)
    : 60 * (Number(process.env.ACESS_TIME) || 60);

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
    
    // Decodifica e limpa a role (ex: ROLE_PSYCHOLOGIST -> psychologist)
    const decoded = jwtDecode<JwtPayload>(data.token);
    const userRoleFromToken = decoded.role.replace('ROLE_', '').toLowerCase();

    const cookieStore = await cookies();

    cookieStore.set('psiconet_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tempoExpiracao,
    });

    // Redireciona dinamicamente para o dashboard correto com base na role do token
    return { success: true, redirectTo: `/${userRoleFromToken}/dashboard` };

  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    return { error: 'Erro de conexão com o servidor.' };
  }
}