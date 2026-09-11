'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUnreadCountAction,
  getNotificationsAction,
  markNotificationAsReadAction,
} from '@/actions/notifications';
import type { NotificationDTO } from '@/types/notification';

const POLL_INTERVAL_MS = 15_000;

export interface UseNotificationsReturn {
  unreadCount: number;
  notifications: NotificationDTO[];
  isLoadingList: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    const count = await getUnreadCountAction();
    setUnreadCount(count);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoadingList(true);
    const result = await getNotificationsAction();
    setNotifications(result);
    setIsLoadingList(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    markNotificationAsReadAction(id).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    pollingRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current !== null) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    notifications,
    isLoadingList,
    fetchNotifications,
    markAsRead,
  };
}
