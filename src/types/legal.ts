export type LegalSlug = 'terms' | 'privacy' | 'cookies';

export interface LegalVersionInfo {
  version: string;
  effectiveDate: string;
}

/** GET /legal/versions — versões vigentes (fonte única: docs/legal do backend) */
export interface LegalVersions {
  terms: LegalVersionInfo;
  privacy: LegalVersionInfo;
  cookies: LegalVersionInfo;
}

/** GET /legal/documents/{slug} */
export interface LegalDocument {
  type: 'TERMS' | 'PRIVACY' | 'COOKIES';
  slug: LegalSlug;
  title: string;
  version: string;
  effectiveDate: string;
  content: string;
}

export type ConsentItem = 'TERMS' | 'PRIVACY' | 'HEALTH_DATA';

/** GET /legal/consents/status */
export interface ConsentStatus {
  consentRequired: boolean;
  pending: ConsentItem[];
  termsVersion: string;
  privacyVersion: string;
}

/** GET /legal/consents/me */
export interface ConsentRecord {
  type: ConsentItem;
  version: string;
  acceptedAt: string;
  source: 'REGISTRATION' | 'REACCEPTANCE' | 'ADMIN_FIRST_ACCESS';
}

export const CONSENT_ITEM_LABELS: Record<ConsentItem, string> = {
  TERMS: 'Termos de Uso',
  PRIVACY: 'Política de Privacidade',
  HEALTH_DATA: 'Tratamento de dados de saúde',
};

export const CONSENT_SOURCE_LABELS: Record<ConsentRecord['source'], string> = {
  REGISTRATION: 'No cadastro',
  REACCEPTANCE: 'Nova versão / reaceite',
  ADMIN_FIRST_ACCESS: 'Primeiro acesso',
};
