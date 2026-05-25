'use server';

import { apiClient } from '@/services/api/apiClient';
import type {
  AdminUser,
  UpdateUserStatusPayload,
  UpdateUserPayload,
} from '@/types/admin';
import type { PaginatedResponse } from '@/types/connection';

/** GET /admin/users — lista paginada de usuários */
export async function getUsersAction(
  page = 0,
  size = 20,
  sort = 'fullName'
): Promise<{ data?: PaginatedResponse<AdminUser>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  return apiClient.get<PaginatedResponse<AdminUser>>(`/admin/users?${params}`);
}

/** PATCH /admin/users/{id}/status — atualiza apenas o status */
export async function updateUserStatusAction(
  id: string,
  payload: UpdateUserStatusPayload
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/admin/users/${id}/status`, payload);
  return result.error ? { error: result.error } : { success: true };
}

/** PUT /admin/users/{id} — atualiza fullName, phone e status */
export async function updateUserAction(
  id: string,
  payload: UpdateUserPayload
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.put(`/admin/users/${id}`, payload);
  return result.error ? { error: result.error } : { success: true };
}
