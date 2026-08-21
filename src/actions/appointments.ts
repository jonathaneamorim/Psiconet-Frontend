'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type {
  AppointmentDTO,
  AppointmentCreateDTO,
  AppointmentCancelDTO,
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

/* Cria um novo agendamento (Apenas Psicólogo) */
export async function createAppointmentAction(
  dto: AppointmentCreateDTO
): Promise<{ data?: AppointmentDTO; error?: string }> {
  const result = await apiClient.post<AppointmentDTO>('/appointments', dto);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/psychologist/appointments');
  revalidatePath('/patient/appointments');
  revalidatePath('/psychologist/dashboard');
  revalidatePath('/patient/dashboard');
  return { data: result.data };
}

/* Aceita um agendamento pendente (Apenas Paciente) */
export async function acceptAppointmentAction(
  id: string
): Promise<{ data?: AppointmentDTO; error?: string }> {
  const result = await apiClient.patch<AppointmentDTO>(`/appointments/${id}/accept`);
  if (result.error) {
    return { error: result.error };
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
  reason?: string
): Promise<{ data?: AppointmentDTO; error?: string }> {
  const body: AppointmentCancelDTO = { reason: reason?.trim() || undefined };
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
