'use client';

import { API_URL } from '@/constants/api';
import type { NotificationDTO, UnreadCount } from '@/types/notification';

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)psiconet_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function clientFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = getTokenFromCookie();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null as T;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const notificationApiClient = {
  getUnreadCount: (): Promise<UnreadCount | null> =>
    clientFetch<UnreadCount>('/notifications/unread-count'),

  getNotifications: (): Promise<NotificationDTO[] | null> =>
    clientFetch<NotificationDTO[]>('/notifications'),

  markAsRead: (id: string): Promise<null> =>
    clientFetch<null>(`/notifications/${id}/read`, { method: 'PATCH' }),
};
