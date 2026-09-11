import type { PaymentStatus } from '@/types/payment';

interface Props {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export function PaymentStatusBadge({ status, size = 'md' }: Props) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pendente
        </span>
      );

    case 'AWAITING_REVIEW':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Em Análise
        </span>
      );

    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Aprovado
        </span>
      );

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-red-50 text-red-700 border border-red-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rejeitado
        </span>
      );

    case 'DISPUTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-violet-50 text-violet-700 border border-violet-200/80 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Contestado
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs ${sizeClasses}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Cancelado
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
