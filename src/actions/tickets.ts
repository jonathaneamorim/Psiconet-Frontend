'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/services/api/apiClient';
import type { PaginatedResponse } from '@/types/connection';
import type { ActionResult } from '@/types/auth';
import type {
  CreateTicketPayload,
  TicketCategory,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketSummary,
} from '@/types/ticket';

// ── Usuário (paciente/psicólogo) ─────────────────────────────────────────────

export async function getMyTicketsAction(
  page = 0,
  status?: TicketStatus | ''
): Promise<{ data?: PaginatedResponse<TicketSummary>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: '10' });
  if (status) params.set('status', status);
  return apiClient.get<PaginatedResponse<TicketSummary>>(`/tickets?${params}`);
}

export async function getMyTicketAction(id: string): Promise<{ data?: TicketDetail; error?: string; status?: number }> {
  return apiClient.get<TicketDetail>(`/tickets/${encodeURIComponent(id)}`);
}

export async function openTicketAction(payload: CreateTicketPayload): Promise<ActionResult & { id?: string }> {
  const result = await apiClient.post<TicketDetail>('/tickets', payload);
  if (result.error || !result.data) {
    return { error: result.error ?? 'Não foi possível abrir o chamado.', fields: result.fieldErrors, code: result.code };
  }
  revalidatePath('/support');
  return { success: true, id: result.data.id, redirectTo: `/support/${result.data.id}` };
}

export async function replyTicketAction(id: string, content: string): Promise<ActionResult & { data?: TicketDetail }> {
  const result = await apiClient.post<TicketDetail>(`/tickets/${encodeURIComponent(id)}/messages`, { content });
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function closeMyTicketAction(id: string): Promise<ActionResult & { data?: TicketDetail }> {
  const result = await apiClient.patch<TicketDetail>(`/tickets/${encodeURIComponent(id)}/close`);
  if (result.error) return { error: result.error };
  revalidatePath('/support');
  return { success: true, data: result.data };
}

// ── Administração ────────────────────────────────────────────────────────────

export interface AdminTicketFilters {
  page?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  category?: TicketCategory | '';
  search?: string;
}

export async function getAdminTicketsAction(
  filters: AdminTicketFilters = {}
): Promise<{ data?: PaginatedResponse<TicketSummary>; error?: string }> {
  const params = new URLSearchParams({ page: String(filters.page ?? 0), size: '20' });
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  return apiClient.get<PaginatedResponse<TicketSummary>>(`/admin/tickets?${params}`);
}

export async function getAdminTicketAction(id: string): Promise<{ data?: TicketDetail; error?: string; status?: number }> {
  return apiClient.get<TicketDetail>(`/admin/tickets/${encodeURIComponent(id)}`);
}

export async function adminReplyTicketAction(id: string, content: string): Promise<ActionResult & { data?: TicketDetail }> {
  const result = await apiClient.post<TicketDetail>(`/admin/tickets/${encodeURIComponent(id)}/messages`, { content });
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  revalidatePath('/admin/tickets');
  return { success: true, data: result.data };
}

export async function adminUpdateTicketStatusAction(id: string, status: TicketStatus): Promise<ActionResult & { data?: TicketDetail }> {
  const result = await apiClient.patch<TicketDetail>(`/admin/tickets/${encodeURIComponent(id)}/status`, { status });
  if (result.error) return { error: result.error };
  revalidatePath('/admin/tickets');
  return { success: true, data: result.data };
}

export async function adminUpdateTicketPriorityAction(id: string, priority: TicketPriority): Promise<ActionResult & { data?: TicketDetail }> {
  const result = await apiClient.patch<TicketDetail>(`/admin/tickets/${encodeURIComponent(id)}/priority`, { priority });
  if (result.error) return { error: result.error };
  revalidatePath('/admin/tickets');
  return { success: true, data: result.data };
}
