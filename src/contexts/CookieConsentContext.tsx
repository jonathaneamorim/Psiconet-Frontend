'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { saveCookieConsentAction } from '@/actions/cookieConsent';
import { availableOptionalCategories, type CookieCategory, type CookieConsent } from '@/lib/cookieConsent';

interface CookieConsentContextValue {
  /** Escolha vigente (null = ainda não decidiu nesta versão da política) */
  consent: CookieConsent | null;
  /** Versão vigente da Política de Cookies (null se a API não respondeu) */
  policyVersion: string | null;
  /** true se a categoria pode ser usada (necessários sempre; demais só com consentimento) */
  hasConsent: (category: CookieCategory) => boolean;
  bannerVisible: boolean;
  preferencesOpen: boolean;
  saving: boolean;
  error: string | null;
  acceptAll: () => Promise<void>;
  rejectOptional: () => Promise<void>;
  save: (categories: CookieCategory[]) => Promise<void>;
  openPreferences: () => void;
  closePreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
  /** Lido do cookie NO SERVIDOR (layout): o banner já sai no HTML inicial, sem "piscar" na hidratação. */
  initialConsent: CookieConsent | null;
  policyVersion: string | null;
}

export function CookieConsentProvider({ children, initialConsent, policyVersion }: ProviderProps) {
  const [consent, setConsent] = useState<CookieConsent | null>(initialConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (categories: CookieCategory[]) => {
    setSaving(true);
    setError(null);
    const result = await saveCookieConsentAction(categories);
    setSaving(false);
    if (result.consent) {
      setConsent(result.consent);
      setPreferencesOpen(false);
    } else {
      setError(result.error ?? 'Não foi possível registrar sua escolha.');
    }
  }, []);

  const value = useMemo<CookieConsentContextValue>(() => ({
    consent,
    policyVersion,
    hasConsent: (category) => category === 'necessary' || (consent?.categories.includes(category) ?? false),
    // Sem versão da política (API fora do ar) não há como registrar a escolha: não exibe o banner.
    bannerVisible: !consent && !!policyVersion && !preferencesOpen,
    preferencesOpen,
    saving,
    error,
    acceptAll: () => save(['necessary', ...availableOptionalCategories()]),
    rejectOptional: () => save(['necessary']),
    save,
    openPreferences: () => setPreferencesOpen(true),
    closePreferences: () => setPreferencesOpen(false),
  }), [consent, policyVersion, preferencesOpen, saving, error, save]);

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

/**
 * Consentimento de cookies no cliente. Qualquer script/cookie NÃO essencial futuro deve ser
 * condicionado a `hasConsent(categoria)` (ou ao componente <ConsentGate>).
 */
export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent deve ser usado dentro de <CookieConsentProvider>.');
  return ctx;
}
