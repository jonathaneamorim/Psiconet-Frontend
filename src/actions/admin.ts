'use server';

import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';
import type {
  AdminUser,
  PaginatedResponse,
  UpdateUserStatusPayload,
  UpdateUserPayload,
} from '@/types/admin';



/** GET /admin/users — lista paginada de usuários */
export async function getUsersAction(
  page = 0,
  size = 20,
  sort = 'fullName'
): Promise<{ data?: PaginatedResponse<AdminUser>; error?: string }> {
  const token = await cookieService.getAuthToken();
  if (!token) return { error: 'Não autenticado.' };

  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    });

    const response = await fetch(`${API_URL}/admin/users?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) return { error: 'Sessão expirada. Faça login novamente.' };
      if (response.status === 403) return { error: 'Acesso negado.' };
      return { error: 'Erro ao buscar usuários.' };
    }

    const data: PaginatedResponse<AdminUser> = await response.json();
    return { data };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

/** PATCH /admin/users/{id}/status — atualiza apenas o status */
export async function updateUserStatusAction(
  id: string,
  payload: UpdateUserStatusPayload
): Promise<{ success?: boolean; error?: string }> {
  const token = await cookieService.getAuthToken();
  if (!token) return { error: 'Não autenticado.' };

  try {
    const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) return { error: 'Usuário não encontrado.' };
      return { error: 'Erro ao atualizar status do usuário.' };
    }

    return { success: true };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}

/** PUT /admin/users/{id} — atualiza fullName, phone e status */
export async function updateUserAction(
  id: string,
  payload: UpdateUserPayload
): Promise<{ success?: boolean; error?: string }> {
  const token = await cookieService.getAuthToken();
  if (!token) return { error: 'Não autenticado.' };

  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) return { error: 'Usuário não encontrado.' };
      if (response.status === 400) return { error: 'Dados inválidos.' };
      return { error: 'Erro ao atualizar usuário.' };
    }

    return { success: true };
  } catch {
    return { error: 'Erro de conexão com o servidor.' };
  }
}
