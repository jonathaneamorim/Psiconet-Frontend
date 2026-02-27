'use server';

import { cookies } from 'next/headers';

interface AuthResponse {
  token: string;
}

export async function loginAction(formData: FormData, role: 'admin' | 'psicologo' | 'paciente',  keepLoggedIn: boolean) {
  const email = formData.get('email');
  const password = formData.get('password');
  const tempoExpiracao = keepLoggedIn 
    ? 24 * 60 * 60 * Number(process.env.KEEP_LOGGED_TIME)
    : 60 * Number(process.env.ACESS_TIME);

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: 'Credenciais inválidas ou usuário não encontrado.' };
    }

    const data: AuthResponse = await response.json();

    // Salvar token nos cookies
    (await cookies()).set('psiconet_token', data.token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tempoExpiracao,
    });

    // Salva tipo de acesso nos cookies
    (await cookies()).set('psiconet_role', role, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tempoExpiracao,
    });

  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    return { error: 'Erro interno no servidor. Tente novamente mais tarde.' };
  }

  return { success: true, redirectTo: `/${role}/dashboard` };
}