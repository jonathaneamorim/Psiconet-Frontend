'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import { getUserRole } from '@/lib/auth';
import { RoleEnum } from '@/enums/RoleEnum';

import type { PsychologistProfile, PatientProfile, UserProfile, PsychologistMeProfile, PatientMeProfile, ProfileUpdateDTO, PatientProfileUpdateDTO } from '@/types/profile';
import type { PaginatedResponse } from '@/types/connection';
import type { BillingSettingsUpdateDTO } from '@/types/payment';

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

/* PATCH /psychologists/me/billing-settings (Apenas Psicólogo) */
export async function updateBillingSettingsAction(
  dto: BillingSettingsUpdateDTO
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/psychologists/me/billing-settings`, dto);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/settings');
  return { success: true };
}

/* GET /psychologists/me — perfil completo do psicólogo autenticado (usado na tela de Configurações) */
export async function getMyPsychologistProfileAction(): Promise<{ data?: PsychologistMeProfile; error?: string }> {
  return apiClient.get<PsychologistMeProfile>('/psychologists/me');
}

/* PATCH /psychologists/me/profile — nome, telefone e bio (Apenas Psicólogo) */
export async function updatePsychologistProfileAction(
  dto: ProfileUpdateDTO
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/psychologists/me/profile`, dto);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/settings');
  return { success: true };
}

/* POST /psychologists/me/photo — multipart/form-data (Apenas Psicólogo) */
export async function updatePsychologistPhotoAction(
  file: File
): Promise<{ data?: PsychologistMeProfile; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiClient.postForm<PsychologistMeProfile>(`/psychologists/me/photo`, formData);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/settings');
  return { data: result.data };
}

/* GET /patients/me — perfil completo do paciente autenticado (usado na tela de Configurações) */
export async function getMyPatientProfileAction(): Promise<{ data?: PatientMeProfile; error?: string }> {
  return apiClient.get<PatientMeProfile>('/patients/me');
}

/* PATCH /patients/me/profile — nome e telefone (Apenas Paciente) */
export async function updatePatientProfileAction(
  dto: PatientProfileUpdateDTO
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/patients/me/profile`, dto);
  if (result.error) return { error: result.error };

  revalidatePath('/patient/settings');
  return { success: true };
}

/* POST /patients/me/photo — multipart/form-data (Apenas Paciente) */
export async function updatePatientPhotoAction(
  file: File
): Promise<{ data?: PatientMeProfile; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiClient.postForm<PatientMeProfile>(`/patients/me/photo`, formData);
  if (result.error) return { error: result.error };

  revalidatePath('/patient/settings');
  return { data: result.data };
}
