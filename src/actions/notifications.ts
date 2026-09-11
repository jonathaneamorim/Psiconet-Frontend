'use server';

import { apiClient } from '@/services/api/apiClient';
import { revalidatePath } from 'next/cache';
import type { NotificationDTO, NotificationPreferenceDTO, UnreadCount } from '@/types/notification';

export async function getUnreadCountAction(): Promise<number> {
  const result = await apiClient.get<UnreadCount>('/notifications/unread-count');
  if (result.error || result.data === undefined || result.data === null) return 0;
  return typeof result.data === 'number' ? result.data : 0;
}

export async function getNotificationsAction(): Promise<NotificationDTO[]> {
  const result = await apiClient.get<NotificationDTO[]>('/notifications');
  if (result.error || !result.data) return [];
  return Array.isArray(result.data) ? result.data : [];
}

export async function markNotificationAsReadAction(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

/*
 * O backend não expõe um endpoint de bulk-read (`PATCH /notifications/read-all` não existe,
 * apenas `PATCH /notifications/{id}/read`). Marca cada notificação não lida individualmente.
 */
export async function markAllNotificationsAsReadAction(unreadIds: string[]): Promise<void> {
  await Promise.allSettled(unreadIds.map((id) => apiClient.patch(`/notifications/${id}/read`)));
}

export async function getNotificationPreferencesAction(): Promise<{ data?: NotificationPreferenceDTO; error?: string }> {
  return apiClient.get<NotificationPreferenceDTO>('/notifications/preferences');
}

export async function updateNotificationPreferencesAction(
  dto: NotificationPreferenceDTO
): Promise<{ data?: NotificationPreferenceDTO; error?: string }> {
  const result = await apiClient.patch<NotificationPreferenceDTO>('/notifications/preferences', dto);
  if (result.error) return { error: result.error };

  revalidatePath('/psychologist/settings');
  revalidatePath('/patient/settings');
  return { data: result.data };
}
