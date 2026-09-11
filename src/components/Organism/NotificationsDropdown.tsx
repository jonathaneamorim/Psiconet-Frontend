'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationDTO, NotificationReferenceType } from '@/types/notification';
import { RoleEnum } from '@/enums/RoleEnum';

function resolveNotificationRoute(
  referenceType: NotificationReferenceType,
  role: RoleEnum | null
): string | null {
  if (!role || (role !== RoleEnum.PATIENT && role !== RoleEnum.PSYCHOLOGIST)) return null;

  const routes: Record<string, string> = {
    APPOINTMENT: `/${role}/appointments`,
    CONNECTION: `/${role}/connections`,
    PAYMENT: `/${role}/payments`,
  };
  return routes[referenceType] ?? null;
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'agora mesmo';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `há ${diffDay}d`;
  const diffMonth = Math.floor(diffDay / 30);
  return `há ${diffMonth} mes${diffMonth > 1 ? 'es' : ''}`;
}

interface NotificationItemProps {
  notification: NotificationDTO;
  onRead: (id: string, referenceType: NotificationReferenceType) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { id, title, message, isRead, referenceType, createdAt } = notification;

  return (
    <button
      type="button"
      onClick={() => onRead(id, referenceType)}
      className={`
        w-full text-left group flex items-start gap-3 px-4 py-3 rounded-xl
        transition-all duration-150 cursor-pointer
        ${!isRead
          ? 'bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100'
          : 'hover:bg-slate-50 border border-transparent'
        }
      `}
      aria-label={`Notificação: ${title}`}
    >
      <span
        className={`
          mt-1.5 flex-shrink-0 w-2 h-2 rounded-full
          transition-all duration-300
          ${!isRead ? 'bg-blue-500 scale-100' : 'bg-transparent scale-0'}
        `}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
          {title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {message}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          {formatRelativeTime(createdAt)}
        </p>
      </div>

      {!isRead && (
        <Check
          size={14}
          className="flex-shrink-0 mt-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

interface Props {
  userRole: RoleEnum | null;
}

export function NotificationsDropdown({ userRole }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    unreadCount,
    notifications,
    isLoadingList,
    fetchNotifications,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Toggle dropdown (lazy-load notifications on first open) ──────────────
  const toggleDropdown = useCallback(() => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // ── Handle notification click: mark as read + navigate ───────────────────
  const handleNotificationClick = useCallback(
    (id: string, referenceType: NotificationReferenceType) => {
      markAsRead(id);
      const route = resolveNotificationRoute(referenceType, userRole);
      if (route) {
        setIsOpen(false);
        router.push(route);
      }
    },
    [markAsRead, router, userRole]
  );

  const hasNotifications = notifications.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Bell Button ── */}
      <button
        id="notifications-toggle"
        type="button"
        onClick={toggleDropdown}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative p-2 rounded-full text-slate-500 hover:text-[var(--primary)] hover:bg-blue-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        <Bell size={22} strokeWidth={1.6} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-75 duration-200"
            aria-live="polite"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      <div
        role="dialog"
        aria-label="Painel de notificações"
        className={`
          fixed left-4 right-4 mt-3 max-w-[360px] bg-white border border-slate-100 rounded-2xl shadow-xl z-50
          sm:absolute sm:left-auto sm:right-0 sm:w-[360px]
          origin-top-right transition-all duration-200 overflow-hidden
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Notificações</h2>
          </div>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto overscroll-contain">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-sm">Carregando notificações…</p>
            </div>
          ) : !hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <BellOff size={28} strokeWidth={1.4} />
              <p className="text-sm font-medium">Nenhuma notificação ainda</p>
              <p className="text-xs text-slate-400 text-center max-w-[200px] leading-relaxed">
                Você será notificado sobre consultas, conexões e cobranças aqui.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1 p-2" role="list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onRead={handleNotificationClick}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {hasNotifications && !isLoadingList && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors w-full text-center"
            >
              Ver todas as notificações →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
