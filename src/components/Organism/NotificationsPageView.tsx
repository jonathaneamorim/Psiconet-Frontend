'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Calendar,
  Link2,
  Wallet,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '@/actions/notifications';
import type { NotificationDTO, NotificationReferenceType } from '@/types/notification';
import { RoleEnum } from '@/enums/RoleEnum';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function resolveRoute(
  referenceType: NotificationReferenceType,
  role: RoleEnum | null,
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

function formatFullDate(isoString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

type FilterType = 'ALL' | 'UNREAD' | 'APPOINTMENT' | 'CONNECTION' | 'PAYMENT';

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'Todas',
  UNREAD: 'Não lidas',
  APPOINTMENT: 'Consultas',
  CONNECTION: 'Conexões',
  PAYMENT: 'Cobranças',
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  APPOINTMENT: <Calendar size={16} />,
  CONNECTION: <Link2 size={16} />,
  PAYMENT: <Wallet size={16} />,
};

const TYPE_COLOR: Record<string, string> = {
  APPOINTMENT: 'bg-violet-100 text-violet-600',
  CONNECTION: 'bg-blue-100 text-blue-600',
  PAYMENT: 'bg-emerald-100 text-emerald-600',
};

// ─── NotificationCard ──────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: NotificationDTO;
  role: RoleEnum | null;
  onRead: (id: string) => void;
}

function NotificationCard({ notification, role, onRead }: NotificationCardProps) {
  const { id, title, message, isRead, referenceType, createdAt } = notification;
  const router = useRouter();

  const route = resolveRoute(referenceType, role);

  function handleClick() {
    if (!isRead) onRead(id);
    if (route) router.push(route);
  }

  const iconColor = TYPE_COLOR[referenceType] || 'bg-slate-100 text-slate-500';
  const icon = TYPE_ICON[referenceType] || <Bell size={16} />;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group w-full text-left flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200
        ${!isRead
          ? 'bg-blue-50/60 border-blue-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm'
          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
        }
      `}
      aria-label={`Notificação: ${title}`}
    >
      {/* Tipo icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
              {title}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" aria-label="Não lida" />
            )}
            {route && (
              <ChevronRight
                size={15}
                className="text-slate-300 group-hover:text-slate-500 transition-colors"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
          {message}
        </p>

        <p className="text-xs text-slate-400 mt-2 font-medium" title={formatFullDate(createdAt)}>
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
  initialNotifications: NotificationDTO[];
  role: RoleEnum | null;
}

export function NotificationsPageView({ initialNotifications, role }: Props) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reload = useCallback(async () => {
    setIsLoading(true);
    const result = await getNotificationsAction();
    setNotifications(result);
    setIsLoading(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    markNotificationAsReadAction(id).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    startTransition(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      try {
        await markAllNotificationsAsReadAction(unreadIds);
      } catch {
        await reload();
      }
    });
  }, [notifications, reload]);

  // Filtros
  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'APPOINTMENT') return n.referenceType === 'APPOINTMENT';
    if (filter === 'CONNECTION') return n.referenceType === 'CONNECTION';
    if (filter === 'PAYMENT') return n.referenceType === 'PAYMENT';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                <Bell size={20} className="text-white" />
              </span>
              Notificações
            </h1>
            <p className="text-slate-500 text-sm mt-1 ml-[52px]">
              {notifications.length === 0
                ? 'Nenhuma notificação ainda'
                : `${notifications.length} notificaç${notifications.length === 1 ? 'ão' : 'ões'}${hasUnread ? ` · ${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : ''}`
              }
            </p>
          </div>

          {hasUnread && (
            <button
              type="button"
              id="mark-all-read-btn"
              onClick={markAllAsRead}
              disabled={isPending}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCheck size={15} />
              )}
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => {
            const count =
              f === 'ALL' ? notifications.length
              : f === 'UNREAD' ? notifications.filter((n) => !n.isRead).length
              : f === 'APPOINTMENT' ? notifications.filter((n) => n.referenceType === 'APPOINTMENT').length
              : f === 'CONNECTION' ? notifications.filter((n) => n.referenceType === 'CONNECTION').length
              : f === 'PAYMENT' ? notifications.filter((n) => n.referenceType === 'PAYMENT').length
              : 0;

            return (
              <button
                key={f}
                type="button"
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all duration-150 flex-shrink-0
                  ${filter === f
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                {FILTER_LABELS[f]}
                {count > 0 && (
                  <span className={`
                    text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Notification List ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Loader2 size={28} className="animate-spin text-blue-400" />
            <p className="text-sm font-medium">Carregando notificações…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <BellOff size={28} strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-600">Nenhuma notificação encontrada</p>
              <p className="text-sm text-slate-400 mt-1">
                {filter === 'ALL'
                  ? 'Você será notificado sobre consultas, conexões e cobranças aqui.'
                  : `Nenhuma notificação do tipo "${FILTER_LABELS[filter]}".`}
              </p>
            </div>
            {filter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                role={role}
                onRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
