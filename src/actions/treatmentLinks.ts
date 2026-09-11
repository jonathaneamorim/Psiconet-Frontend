'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';

/* Atualiza o preço padrão do vínculo de tratamento (Apenas Psicólogo) */
export async function updateTreatmentLinkPriceAction(
  treatmentLinkId: string,
  defaultPrice: number
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/treatment-links/${treatmentLinkId}/price`, { defaultPrice });
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/connections');
  return { success: true };
}
