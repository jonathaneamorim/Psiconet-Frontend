/*
 * Consentimento de cookies (ADR 012 do backend). Funções puras, usadas no servidor (layout e Server
 * Action) e no cliente (provider). Hoje só existem cookies ESTRITAMENTE NECESSÁRIOS; as demais
 * categorias já estão modeladas (available: false) para que um uso futuro só precise:
 *   1) marcar a categoria como disponível e listar os cookies dela aqui;
 *   2) atualizar a Política de Cookies (nova versão ⇒ o banner pergunta de novo);
 *   3) carregar o script com <ConsentGate category="..."> / useCookieConsent().hasConsent(...).
 */

export type CookieCategory = 'necessary' | 'preferences' | 'statistics' | 'marketing';

export interface CookieInfo {
  name: string;
  purpose: string;
  duration: string;
  provider: string;
}

export interface CookieCategoryDefinition {
  id: CookieCategory;
  label: string;
  description: string;
  /** Sempre ativa e não pode ser desligada (estritamente necessária). */
  locked: boolean;
  /** Existe algum cookie desta categoria hoje? Categorias indisponíveis não são oferecidas. */
  available: boolean;
  cookies: CookieInfo[];
}

export const COOKIE_CATEGORIES: CookieCategoryDefinition[] = [
  {
    id: 'necessary',
    label: 'Estritamente necessários',
    description: 'Mantêm você conectado com segurança e guardam a sua escolha sobre cookies. Sem eles o site não funciona, por isso ficam sempre ativos.',
    locked: true,
    available: true,
    cookies: [
      { name: 'psiconet_token', purpose: 'Token de acesso da sessão (protegido, HttpOnly)', duration: '15 min, renovado automaticamente; sem "manter conectado", some ao fechar o navegador', provider: 'Psiconet' },
      { name: 'psiconet_refresh', purpose: 'Renova o acesso e permite encerrar a sessão do dispositivo (protegido, HttpOnly)', duration: 'Sessão do navegador (2 h sem uso, 12 h no total) ou, com "manter conectado", 7 dias sem uso até 30 dias', provider: 'Psiconet' },
      { name: 'psiconet_consent', purpose: 'Guarda esta escolha (versão da política, categorias e data)', duration: '180 dias', provider: 'Psiconet' },
    ],
  },
  {
    id: 'preferences',
    label: 'Preferências',
    description: 'Lembrariam escolhas de interface. A Psiconet não usa cookies desta categoria.',
    locked: false,
    available: false,
    cookies: [],
  },
  {
    id: 'statistics',
    label: 'Estatísticos',
    description: 'Mediriam o uso do site de forma agregada. A Psiconet não usa analytics.',
    locked: false,
    available: false,
    cookies: [],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Seriam usados para publicidade e rastreamento entre sites. A Psiconet não usa.',
    locked: false,
    available: false,
    cookies: [],
  },
];

export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export interface CookieConsent {
  /** Versão da Política de Cookies aceita (GET /legal/versions → cookies.version) */
  version: string;
  categories: CookieCategory[];
  /** Data da escolha (ISO, definida no servidor) */
  date: string;
}

const KNOWN = new Set<CookieCategory>(COOKIE_CATEGORIES.map((c) => c.id));

/** Normaliza categorias escolhidas: só conhecidas e disponíveis; "necessary" sempre presente. */
export function normalizeCategories(input: readonly string[]): CookieCategory[] {
  const allowed = new Set<CookieCategory>(['necessary']);
  for (const value of input) {
    const def = COOKIE_CATEGORIES.find((c) => c.id === value);
    if (def && def.available && KNOWN.has(def.id)) allowed.add(def.id);
  }
  return COOKIE_CATEGORIES.map((c) => c.id).filter((id) => allowed.has(id));
}

export function availableOptionalCategories(): CookieCategory[] {
  return COOKIE_CATEGORIES.filter((c) => c.available && !c.locked).map((c) => c.id);
}

export function serializeConsent(consent: CookieConsent): string {
  return JSON.stringify({ v: consent.version, c: consent.categories, d: consent.date });
}

/**
 * Lê o cookie. Retorna null se ausente, inválido ou de OUTRA versão da política (⇒ perguntar de novo).
 */
export function parseConsent(raw: string | null | undefined, currentVersion: string | null): CookieConsent | null {
  if (!raw || !currentVersion) return null;
  try {
    const data = JSON.parse(raw) as { v?: unknown; c?: unknown; d?: unknown };
    if (data.v !== currentVersion || !Array.isArray(data.c) || typeof data.d !== 'string') return null;
    return { version: currentVersion, categories: normalizeCategories(data.c.filter((x): x is string => typeof x === 'string')), date: data.d };
  } catch {
    return null;
  }
}
