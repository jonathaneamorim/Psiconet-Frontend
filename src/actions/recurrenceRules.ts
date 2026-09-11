'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type { RecurrenceRuleCreateDTO, RecurrenceRuleDTO } from '@/types/recurrence';
import type { PaginatedResponse } from '@/types/connection';

/* Cria uma regra de recorrência para um vínculo de tratamento (Apenas Psicólogo) */
export async function createRecurrenceRuleAction(
  treatmentLinkId: string,
  dto: RecurrenceRuleCreateDTO
): Promise<{ data?: RecurrenceRuleDTO; error?: string }> {
  const result = await apiClient.post<RecurrenceRuleDTO>(
    `/treatment-links/${treatmentLinkId}/recurrence-rules`,
    dto
  );
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/appointments');
  revalidatePath('/patient/appointments');
  revalidatePath('/psychologist/dashboard');
  revalidatePath('/patient/dashboard');
  return { data: result.data };
}

/* Lista as regras de recorrência de um vínculo de tratamento (paginado) */
export async function getRecurrenceRulesAction(
  treatmentLinkId: string,
  page = 0,
  size = 10
): Promise<{ data?: PaginatedResponse<RecurrenceRuleDTO>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return apiClient.get<PaginatedResponse<RecurrenceRuleDTO>>(
    `/treatment-links/${treatmentLinkId}/recurrence-rules?${params}`
  );
}

/* Desativa uma regra de recorrência (Apenas Psicólogo) */
export async function deactivateRecurrenceRuleAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/recurrence-rules/${id}/deactivate`);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/appointments');
  revalidatePath('/patient/appointments');
  return { success: true };
}

/*
 * Calcula (sem persistir) as datas futuras de uma série recorrente, para o calendário
 * exibir a série inteira sem depender de vários Appointments gerados no backend.
 */
export async function previewRecurrenceRuleAction(
  ruleId: string,
  from: string,
  to: string
): Promise<{ data?: string[]; error?: string }> {
  const params = new URLSearchParams({ from, to });
  return apiClient.get<string[]>(`/recurrence-rules/${ruleId}/preview?${params}`);
}
