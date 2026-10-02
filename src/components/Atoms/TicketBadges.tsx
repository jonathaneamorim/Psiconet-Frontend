import {
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type TicketPriority,
  type TicketStatus,
} from '@/types/ticket';

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  LOW: 'bg-slate-50 text-slate-600 border-slate-200',
  MEDIUM: 'bg-sky-50 text-sky-800 border-sky-200',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-200',
  URGENT: 'bg-red-50 text-red-700 border-red-200',
};

/** Situação do chamado — sempre com texto (cor nunca é a única informação). */
export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {TICKET_STATUS_LABEL[status]}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${PRIORITY_STYLE[priority]}`}>
      Prioridade {TICKET_PRIORITY_LABEL[priority].toLowerCase()}
    </span>
  );
}
