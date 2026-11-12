'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type {
  AppointmentDTO,
  AppointmentCreateDTO,
  AppointmentCancelDTO,
  AppointmentCancelScope,
  AppointmentStatsDTO,
  OverlapSummary,
} from '@/types/appointment';
import type { PaginatedResponse } from '@/types/connection';


/*Lista os agendamentos do usuário autenticado (Psicólogo ou Paciente) */
export async function getMyAppointmentsAction(
  page = 0,
  size = 100,
  sort = 'startDateTime,asc'
): Promise<{ data?: PaginatedResponse<AppointmentDTO>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  return apiClient.get<PaginatedResponse<AppointmentDTO>>(`/appointments?${params}`);
}

/* Detalhe de uma consulta (só psicólogo ou paciente do vínculo; demais recebem 404) */
export async function getAppointmentAction(
  id: string
): Promise<{ data?: AppointmentDTO; error?: string; status?: number }> {
  const result = await apiClient.get<AppointmentDTO>(`/appointments/${encodeURIComponent(id)}`);
  return result.error ? { error: result.error, status: result.status } : { data: result.data };
}

/* Contagem por status das consultas do mês exibido no calendário */
export async function getAppointmentStatsAction(
  year: number,
  month: number
): Promise<{ data?: AppointmentStatsDTO; error?: string }> {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  return apiClient.get<AppointmentStatsDTO>(`/appointments/stats?${params}`);
}

/* Cria um novo agendamento (Apenas Psicólogo) */
export async function createAppointmentAction(
  dto: AppointmentCreateDTO
): Promise<CreateAppointmentResult> {
  const result = await apiClient.post<AppointmentDTO>('/appointments', dto);
  if (result.error) {
    return { error: result.error, code: result.code, conflicts: result.conflicts as OverlapSummary[] | undefined };
  }

  revalidatePath('/psychologist/appointments');
  revalidatePath('/patient/appointments');
  revalidatePath('/psychologist/dashboard');
  revalidatePath('/patient/dashboard');
  return { data: result.data };
}

/* Cancela um agendamento (Psicólogo ou Paciente com justificativa) */
export async function cancelAppointmentAction(
  id: string,
  reason?: string,
  cancelScope?: AppointmentCancelScope
): Promise<{ data?: AppointmentDTO; error?: string }> {
  const body: AppointmentCancelDTO = { reason: reason?.trim() || undefined, cancelScope };
  const result = await apiClient.patch<AppointmentDTO>(`/appointments/${id}/cancel`, body);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/psychologist/appointments');
  revalidatePath('/patient/appointments');
  revalidatePath('/psychologist/dashboard');
  revalidatePath('/patient/dashboard');
  return { data: result.data };
}

/** Resultado de criação: `conflicts` vem junto do código SCHEDULE_OVERLAP (horário ocupado, sem confirmação). */
export interface CreateAppointmentResult {
  data?: AppointmentDTO;
  error?: string;
  code?: string;
  conflicts?: OverlapSummary[];
}

/* Pré-checagem de sobreposição para o aviso em tempo real do formulário (só psicólogo, só a própria agenda) */
export async function checkAppointmentOverlapsAction(
  startDateTime: string,
  endDateTime: string,
  excludeId?: string
): Promise<{ data?: OverlapSummary[]; error?: string }> {
  const params = new URLSearchParams({ start: startDateTime, end: endDateTime });
  if (excludeId) params.set('excludeId', excludeId);
  const result = await apiClient.get<OverlapSummary[]>(`/appointments/overlaps?${params}`, { background: true });
  return result.error ? { error: result.error } : { data: result.data ?? [] };
}
