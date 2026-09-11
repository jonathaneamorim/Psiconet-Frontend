'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type { FinancialSummaryDTO, PaymentDTO, PaymentStatus } from '@/types/payment';
import type { PaginatedResponse } from '@/types/connection';

/* Lista os pagamentos do usuário autenticado (Psicólogo ou Paciente), com filtro opcional por status */
export async function getMyPaymentsAction(
  page = 0,
  size = 10,
  status?: PaymentStatus
): Promise<{ data?: PaginatedResponse<PaymentDTO>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status);
  return apiClient.get<PaginatedResponse<PaymentDTO>>(`/payments?${params}`);
}

export async function getPaymentByIdAction(
  id: string
): Promise<{ data?: PaymentDTO; error?: string }> {
  return apiClient.get<PaymentDTO>(`/payments/${id}`);
}

/* GET /payments/summary?year=&month= — resumo financeiro do mês (default: mês corrente) */
export async function getFinancialSummaryAction(
  year?: number,
  month?: number
): Promise<{ data?: FinancialSummaryDTO; error?: string }> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const query = params.toString();
  return apiClient.get<FinancialSummaryDTO>(`/payments/summary${query ? `?${query}` : ''}`);
}

/* Envia o comprovante de pagamento (Apenas Paciente) — multipart/form-data, sem base64 */
export async function uploadPaymentReceiptAction(
  id: string,
  file: File
): Promise<{ data?: PaymentDTO; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiClient.postForm<PaymentDTO>(`/payments/${id}/receipt`, formData);
  if (result.error) return { error: result.error };

  revalidatePath('/patient/payments');
  revalidatePath('/psychologist/payments');
  return { data: result.data };
}

/* Aprova um pagamento (Apenas Psicólogo) */
export async function approvePaymentAction(
  id: string
): Promise<{ data?: PaymentDTO; error?: string }> {
  const result = await apiClient.patch<PaymentDTO>(`/payments/${id}/approve`);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/payments');
  revalidatePath('/patient/payments');
  return { data: result.data };
}

/* Rejeita um pagamento com motivo obrigatório (Apenas Psicólogo) */
export async function rejectPaymentAction(
  id: string,
  reason: string
): Promise<{ data?: PaymentDTO; error?: string }> {
  const result = await apiClient.patch<PaymentDTO>(`/payments/${id}/reject`, { reason });
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/payments');
  revalidatePath('/patient/payments');
  return { data: result.data };
}

/* Contesta a rejeição de um pagamento com mensagem obrigatória (Apenas Paciente) */
export async function disputePaymentAction(
  id: string,
  message: string
): Promise<{ data?: PaymentDTO; error?: string }> {
  const result = await apiClient.post<PaymentDTO>(`/payments/${id}/dispute`, { message });
  if (result.error) return { error: result.error };

  revalidatePath('/patient/payments');
  revalidatePath('/psychologist/payments');
  return { data: result.data };
}
