"use server";

import { redirect } from 'next/navigation';
import { cookieService } from '@/services/cookieService';
import { ROUTES } from '@/config/routes';

export async function logoutAction() {
    await cookieService.clearAuth();
    redirect(ROUTES.HOME);
}