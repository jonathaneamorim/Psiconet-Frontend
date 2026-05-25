'use server';

import { ROUTES } from '@/config/routes';
import { RoleEnum } from '@/enums/RoleEnum';
import { normalizeCpf } from '@/lib/cpf';
import { apiClient } from '@/services/api/apiClient';

type RegisterResponse = {
  success?: boolean;
  redirectTo?: string;
  error?: string;
  fields?: Record<string, string>;
};

export async function registerAction(formData: FormData): Promise<RegisterResponse> {
  const role = formData.get('userRole') as RoleEnum;

  const path =
    role === RoleEnum.PATIENT
      ? '/auth/register/patient'
      : '/auth/register/psychologist';

  const payload = {
    fullName: formData.get('fullName')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    cpf: normalizeCpf(formData.get('cpf')?.toString() ?? ''),
    birthDate: formData.get('birthDate')?.toString().trim(),
    password: formData.get('password')?.toString(),
    ...(role === RoleEnum.PSYCHOLOGIST && {
      crp: formData.get('crp')?.toString().trim(),
    }),
  };

  const result = await apiClient.post(path, payload, { public: true });

  if (result.error) {
    return { error: result.error };
  }

  return { success: true, redirectTo: ROUTES.LOGIN };
}