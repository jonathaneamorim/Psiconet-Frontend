import { API_URL } from '@/constants/api';
import type { LegalDocument, LegalSlug, LegalVersions } from '@/types/legal';

/*
 * Leitura PÚBLICA dos documentos legais e versões (sem token). Cache curto do Next (5 min), igual
 * ao Cache-Control da API: uma nova versão aparece em no máximo alguns minutos após o deploy.
 */
const REVALIDATE_SECONDS = 300;

async function getPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getLegalVersions(): Promise<LegalVersions | null> {
  return getPublic<LegalVersions>('/legal/versions');
}

export function getLegalDocument(slug: LegalSlug): Promise<LegalDocument | null> {
  return getPublic<LegalDocument>(`/legal/documents/${slug}`);
}
