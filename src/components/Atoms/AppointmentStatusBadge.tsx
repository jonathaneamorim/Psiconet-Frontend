import type { AppointmentStatus } from '@/types/appointment';

interface Props {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function AppointmentStatusBadge({ status, size = 'md' }: Props) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  switch (status) {
    case 'SCHEDULED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pendente
        </span>
      );

    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Confirmada
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelada
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Realizada
        </span>
      );

    case 'NO_SHOW':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Não Compareceu
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
