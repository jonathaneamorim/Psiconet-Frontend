'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type {
  ActiveConnectionDTO,
  ConnectionRequest,
  PaginatedResponse,
} from '@/types/connection';

/* Lista as conexões ativas do usuário autenticado (paginado) */
export async function getActiveConnectionsAction(
  page = 0,
  size = 10,
  sort = 'connectedAt,desc'
): Promise<{ data?: PaginatedResponse<ActiveConnectionDTO>; error?: string }> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  return apiClient.get<PaginatedResponse<ActiveConnectionDTO>>(`/connections?${params}`);
}

/*
 * Resolve o estado de conexão entre o usuário autenticado e um usuário alvo.
 * Consulta pendentes e ativos em paralelo para retornar o status correto.
 */
export async function getConnectionStatusAction(targetUserId: string): Promise<{
  status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  connectionId?: string;
}> {
  const [activeResult, pendingResult] = await Promise.all([
    getActiveConnectionsAction(0, 100),
    getPendingRequestsAction(),
  ]);

  if (activeResult.data) {
    const match = activeResult.data.content.find((c) => c.user.id === targetUserId);
    if (match) return { status: 'CONNECTED', connectionId: match.connectionId };
  }

  if (pendingResult.data) {
    for (const req of pendingResult.data.content) {
      if (req.sender.id === targetUserId) return { status: 'PENDING_RECEIVED', connectionId: req.id };
      if (req.receiver.id === targetUserId) return { status: 'PENDING_SENT', connectionId: req.id };
    }
  }

  return { status: 'NONE' };
}

export async function getPendingRequestsAction(
  page = 0,
  size = 100
): Promise<{
  data?: PaginatedResponse<ConnectionRequest>;
  error?: string;
}> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return apiClient.get<PaginatedResponse<ConnectionRequest>>(`/connections/pending?${params}`);
}

/* Envia uma solicitação de conexão para um usuário */
export async function sendConnectionRequestAction(
  targetUserId: string
): Promise<{ success?: boolean; error?: string; connectionId?: string }> {
  const result = await apiClient.post<{ id?: string }>(`/connections/${targetUserId}`);
  if (result.error) return { error: result.error };

  revalidatePath('/patient/connections');
  revalidatePath('/psychologist/connections');
  revalidatePath(`/patient/profile/${targetUserId}`, 'page');
  revalidatePath(`/psychologist/profile/${targetUserId}`, 'page');
  return { success: true, connectionId: result.data?.id };
}

/* Aceita uma solicitação de conexão pendente */
export async function acceptConnectionAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/connections/${id}/accept`);
  if (!result.error) {
    revalidatePath('/patient/connections');
    revalidatePath('/psychologist/connections');
    return { success: true };
  }
  return { error: result.error };
}

/* Rejeita uma solicitação de conexão pendente */
export async function rejectConnectionAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.patch(`/connections/${id}/reject`);
  if (!result.error) {
    revalidatePath('/patient/connections');
    revalidatePath('/psychologist/connections');
    return { success: true };
  }
  return { error: result.error };
}


/* Remove uma conexão ativa */
export async function removeConnectionAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiClient.delete(`/connections/${id}`);
  if (!result.error) {
    revalidatePath('/patient/connections');
    revalidatePath('/psychologist/connections');
    return { success: true };
  }
  return { error: result.error };
}
