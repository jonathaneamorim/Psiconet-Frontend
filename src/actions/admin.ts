'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/services/api/apiClient';
import type {
  AdminDashboard,
  AdminUser,
  AdminUserFilters,
  CreateAdminPayload,
  NotifyUserPayload,
  UpdateUserStatusPayload,
  UpdateUserPayload,
} from '@/types/admin';
import type { PaginatedResponse } from '@/types/connection';
import type { ActionResult } from '@/types/auth';

/** GET /admin/users — lista paginada com busca e filtros aplicados no servidor */
export async function getUsersAction(
  filters: AdminUserFilters = {}
): Promise<{ data?: PaginatedResponse<AdminUser>; error?: string }> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 20),
    sort: filters.sort ?? 'fullName',
  });
  if (filters.search) params.set('search', filters.search);
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);
  return apiClient.get<PaginatedResponse<AdminUser>>(`/admin/users?${params}`);
}

/** PATCH /admin/users/{id}/status — ativar, inativar ou bloquear */
export async function updateUserStatusAction(
  id: string,
  payload: UpdateUserStatusPayload
): Promise<ActionResult> {
  const result = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/status`, payload);
  if (result.error) return { error: result.error };
  revalidatePath('/admin/users');
  return { success: true };
}

/** PUT /admin/users/{id} — corrige nome, telefone e e-mail */
export async function updateUserAction(id: string, payload: UpdateUserPayload): Promise<ActionResult> {
  const result = await apiClient.put(`/admin/users/${encodeURIComponent(id)}`, payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  revalidatePath('/admin/users');
  return { success: true };
}

/** POST /admin/admins — cria um NOVO administrador */
export async function createAdminAction(payload: CreateAdminPayload): Promise<ActionResult> {
  const result = await apiClient.post('/admin/admins', payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  revalidatePath('/admin/users');
  return { success: true };
}

/** POST /admin/notifications — comunicado (notificação no site + e-mail) */
export async function notifyUserAction(payload: NotifyUserPayload): Promise<ActionResult> {
  const result = await apiClient.post('/admin/notifications', payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true };
}

/** GET /admin/dashboard — indicadores agregados */
export async function getAdminDashboardAction(): Promise<{ data?: AdminDashboard; error?: string }> {
  return apiClient.get<AdminDashboard>('/admin/dashboard');
}
