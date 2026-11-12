"use server";

import { redirect } from 'next/navigation';
import { cookieService } from '@/services/cookieService';
import { apiClient } from '@/services/api/apiClient';
import { ROUTES } from '@/config/routes';

/** "Sair": encerra a sessão deste dispositivo no backend (o token dela morre na hora) e apaga os cookies. */
export async function logoutAction() {
    await apiClient.post('/auth/logout', undefined, { background: true }).catch(() => undefined);
    await cookieService.clearAuth();
    redirect(ROUTES.HOME);
}

/** "Sair de todos os dispositivos": encerra todas as sessões da conta (ADR 014 do backend). */
export async function logoutAllDevicesAction() {
    await apiClient.post('/auth/logout-all', undefined, { background: true }).catch(() => undefined);
    await cookieService.clearAuth();
    redirect(`${ROUTES.LOGIN}?saida=todos`);
}
