'use server';

import { apiClient } from '@/services/api/apiClient';
import { getUserRole } from '@/lib/auth';
import { ROUTES } from '@/config/routes';
import type { ActionResult } from '@/types/auth';
import type { ConsentRecord, ConsentStatus } from '@/types/legal';

/* GET /legal/consents/status — o que falta (re)aceitar */
export async function getConsentStatusAction(): Promise<{ data?: ConsentStatus; error?: string }> {
  return apiClient.get<ConsentStatus>('/legal/consents/status');
}

/* GET /legal/consents/me — histórico de aceites do titular */
export async function getConsentHistoryAction(): Promise<{ data?: ConsentRecord[]; error?: string }> {
  return apiClient.get<ConsentRecord[]>('/legal/consents/me');
}

/* POST /legal/consents — reaceite (as versões são as que o usuário viu na tela) */
export async function acceptTermsAction(formData: FormData): Promise<ActionResult> {
  const result = await apiClient.post<ConsentStatus>('/legal/consents', {
    acceptTerms: formData.get('acceptTerms') === 'on',
    acceptHealthData: formData.get('acceptHealthData') === 'on',
    termsVersion: formData.get('termsVersion')?.toString() ?? '',
    privacyVersion: formData.get('privacyVersion')?.toString() ?? '',
  });

  if (result.error || !result.data) {
    return { error: result.error ?? 'Não foi possível registrar o aceite.', fields: result.fieldErrors, code: result.code };
  }

  const role = await getUserRole();
  return { success: true, redirectTo: role ? `/${role}/dashboard` : ROUTES.LOGIN };
}
