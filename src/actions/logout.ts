"use server";

import { redirect } from 'next/navigation';
import { cookieService } from '@/services/cookieService';
import { apiClient } from '@/services/api/apiClient';
import { ROUTES } from '@/config/routes';

export async function logoutAction() {
    // Invalida o token no backend (versão de token) antes de apagar o cookie: um token copiado
    // deixa de funcionar imediatamente, não só quando expirar.
    await apiClient.post('/auth/logout').catch(() => undefined);
    await cookieService.clearAuth();
    redirect(ROUTES.HOME);
}
