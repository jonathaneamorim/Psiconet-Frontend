'use server';

import { cookies } from 'next/headers';
import { COOKIE_CONSENT } from '@/constants/cookies';
import { CONSENT_MAX_AGE_SECONDS, normalizeCategories, serializeConsent, type CookieConsent } from '@/lib/cookieConsent';
import { getLegalVersions } from '@/services/legalService';

/*
 * Grava a escolha do banner. A versão da política e a data vêm do SERVIDOR (nunca do cliente), e
 * as categorias são filtradas pelas que existem de fato. Cookie de primeira parte, sem HttpOnly
 * (scripts futuros precisam respeitar a escolha), SameSite=Lax, 180 dias.
 */
export async function saveCookieConsentAction(
  categories: string[]
): Promise<{ consent?: CookieConsent; error?: string }> {
  const versions = await getLegalVersions();
  if (!versions) return { error: 'Não foi possível registrar sua escolha agora. Tente novamente.' };

  const consent: CookieConsent = {
    version: versions.cookies.version,
    categories: normalizeCategories(Array.isArray(categories) ? categories : []),
    date: new Date().toISOString(),
  };

  (await cookies()).set(COOKIE_CONSENT, serializeConsent(consent), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CONSENT_MAX_AGE_SECONDS,
  });

  return { consent };
}
