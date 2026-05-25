import type { UserStatus } from '@/types/admin';

const statusConfig: Record<
  UserStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  ACTIVE: {
    label: 'Ativo',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  INACTIVE: {
    label: 'Inativo',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
  PENDING: {
    label: 'Pendente',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  SUSPENDED: {
    label: 'Suspenso',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

interface Props {
  status: UserStatus;
}

export function UserStatusBadge({ status }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.INACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
