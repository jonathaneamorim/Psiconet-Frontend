'use server';

import { apiClient } from '@/services/api/apiClient';
import type { VideoConfigDTO, VideoJoinResponseDTO } from '@/types/video';

/* Disponibilidade da Sala Psiconet (feature flag do backend). Falha ⇒ tratada como desligada. */
export async function getVideoConfigAction(): Promise<VideoConfigDTO> {
  const result = await apiClient.get<VideoConfigDTO>('/video/config', { background: true });
  return { enabled: Boolean(result.data?.enabled) };
}

/*
 * Credencial de entrada na sala. O JWT da sessão está em cookie httpOnly, então o navegador não
 * fala direto com a API: esta action busca o token do provedor no servidor e o devolve só para a
 * memória da página da chamada. O backend valida participação, janela e limite de requisições.
 */
export async function joinVideoCallAction(appointmentId: string): Promise<{
  data?: VideoJoinResponseDTO;
  error?: string;
  status?: number;
  code?: string;
  retryAfter?: number;
}> {
  const result = await apiClient.post<VideoJoinResponseDTO>(`/appointments/${encodeURIComponent(appointmentId)}/video/join`);
  if (result.error) {
    return { error: result.error, status: result.status, code: result.code, retryAfter: result.retryAfter };
  }
  return { data: result.data };
}

/* Psicólogo encerra a sessão para todos. */
export async function endVideoCallAction(appointmentId: string): Promise<{ error?: string }> {
  const result = await apiClient.post<void>(`/appointments/${encodeURIComponent(appointmentId)}/video/end`);
  return result.error ? { error: result.error } : {};
}
