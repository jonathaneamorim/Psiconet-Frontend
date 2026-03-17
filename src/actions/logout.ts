"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN } from '@/constants/cookies';
import { ROUTES } from '@/config/routes';

export async function logoutAction() {
    (await cookies()).delete(COOKIE_TOKEN);
    redirect(ROUTES.HOME);
}