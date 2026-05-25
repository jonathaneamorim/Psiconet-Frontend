import type { UserRole } from '@/types/admin';

const roleConfig: Record<UserRole, { label: string; bg: string; text: string }> = {
  ADMIN: {
    label: 'Admin',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
  PSYCHOLOGIST: {
    label: 'Psicólogo',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  PATIENT: {
    label: 'Paciente',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
  },
};

interface Props {
  role: UserRole;
}

export function UserRoleBadge({ role }: Props) {
  const cfg = roleConfig[role] ?? roleConfig.PATIENT;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
