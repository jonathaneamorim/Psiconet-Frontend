'use server';

import { apiClient } from '@/services/api/apiClient';
import { getUserRole } from '@/lib/auth';
import { RoleEnum } from '@/enums/RoleEnum';

import type { PsychologistProfile, PatientProfile, UserProfile } from '@/types/profile';
import type { PaginatedResponse } from '@/types/connection';

export async function getPsychologistProfileAction(
  id: string
): Promise<{ data?: PsychologistProfile; error?: string }> {
  return apiClient.get<PsychologistProfile>(`/psychologists/${id}`);
}

export async function getPatientProfileAction(
  id: string
): Promise<{ data?: PatientProfile; error?: string }> {
  return apiClient.get<PatientProfile>(`/patients/${id}`);
}


/* GET /patients/me ou /psychologists/me — perfil do usuário autenticado */
export async function getMeProfileAction(): Promise<{ data?: UserProfile; error?: string }> {
  const role = await getUserRole();
  if (!role) return { error: 'Role não encontrado.' };

  const path = role === RoleEnum.PATIENT ? '/patients/me' : '/psychologists/me';
  return apiClient.get<UserProfile>(path);
}

/* GET /psychologists/search?name={name} */
export async function searchPsychologistsAction(
  name: string,
  page = 0,
  size = 10
): Promise<{ data?: PaginatedResponse<PsychologistProfile>; error?: string }> {
  const params = new URLSearchParams({ name, page: String(page), size: String(size) });
  return apiClient.get<PaginatedResponse<PsychologistProfile>>(`/psychologists/search?${params}`);
}

/* GET /patients/search?name={name} */
export async function searchPatientsAction(
  name: string,
  page = 0,
  size = 10
): Promise<{ data?: PaginatedResponse<PatientProfile>; error?: string }> {
  const params = new URLSearchParams({ name, page: String(page), size: String(size) });
  return apiClient.get<PaginatedResponse<PatientProfile>>(`/patients/search?${params}`);
}
