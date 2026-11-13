import { API_URL } from '@/constants/api';
import type { LegalDocument, LegalSlug, LegalVersions } from '@/types/legal';

/*
 * Leitura PÚBLICA dos documentos legais e versões (sem token). SEM cache do Next de propósito:
 * a versão lida aqui é a que o usuário aceita no cadastro (o backend recusa versão desatualizada
 * com 409 LEGAL_VERSION_OUTDATED) e a que o banner de cookies grava. Com `revalidate`, o Data Cache
 * podia servir uma versão antiga indefinidamente (inclusive após `router.refresh()`), e o cadastro
 * ficava preso em "os documentos foram atualizados" mesmo com o aceite marcado.
 */
async function getPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
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
