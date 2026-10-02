'use client';

import type { ReactNode } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import type { CookieCategory } from '@/lib/cookieConsent';

/**
 * Renderiza `children` (ex.: <Script> de analytics) SÓ depois do consentimento da categoria.
 * Hoje nenhum componente usa — a Psiconet não tem cookies opcionais —, mas é o único caminho
 * permitido para carregar qualquer recurso não essencial no futuro.
 */
export function ConsentGate({ category, children }: { category: Exclude<CookieCategory, 'necessary'>; children: ReactNode }) {
  const { hasConsent } = useCookieConsent();
  return hasConsent(category) ? <>{children}</> : null;
}
