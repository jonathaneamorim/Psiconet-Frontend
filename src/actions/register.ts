'use server';

import { ROUTES } from '@/config/routes';
import { RoleEnum } from '@/enums/RoleEnum';
import { normalizeCpf } from '@/lib/cpf';
import { apiClient } from '@/services/api/apiClient';
import type { ActionResult } from '@/types/auth';

interface RegisterResponse {
  message: string;
  nextStep: 'LOGIN';
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  // O papel só escolhe o endpoint; o backend nunca aceita "role" no corpo.
  const role = formData.get('userRole') === RoleEnum.PSYCHOLOGIST ? RoleEnum.PSYCHOLOGIST : RoleEnum.PATIENT;

  const path =
    role === RoleEnum.PATIENT
      ? '/auth/register/patient'
      : '/auth/register/psychologist';

  const payload = {
    fullName: formData.get('fullName')?.toString().trim(),
    email: formData.get('email')?.toString().trim().toLowerCase(),
    cpf: normalizeCpf(formData.get('cpf')?.toString() ?? ''),
    birthDate: formData.get('birthDate')?.toString().trim() || null,
    password: formData.get('password')?.toString(),
    // Aceite (ADR 013 do backend): versões que o usuário viu; data, IP e navegador ficam com o servidor.
    acceptTerms: formData.get('acceptTerms') === 'on',
    termsVersion: formData.get('termsVersion')?.toString() ?? '',
    privacyVersion: formData.get('privacyVersion')?.toString() ?? '',
    ...(role === RoleEnum.PATIENT && {
      acceptHealthData: formData.get('acceptHealthData') === 'on',
    }),
    ...(role === RoleEnum.PSYCHOLOGIST && {
      crp: formData.get('crp')?.toString().trim(),
    }),
  };

  const result = await apiClient.post<RegisterResponse>(path, payload, { public: true });

  if (result.error) {
    return { error: result.error, fields: result.fieldErrors, code: result.code };
  }

  return {
    success: true,
    message: result.data?.message ?? 'Conta criada com sucesso! Faça login para continuar.',
    redirectTo: `${ROUTES.LOGIN}?cadastro=sucesso&email=${encodeURIComponent(payload.email ?? '')}`,
  };
}
