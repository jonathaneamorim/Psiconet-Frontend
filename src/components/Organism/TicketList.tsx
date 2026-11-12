import Link from 'next/link';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/Atoms/TicketBadges';
import { TICKET_CATEGORY_LABEL, type TicketSummary } from '@/types/ticket';
import { formatDateTime } from '@/lib/datetime';

interface Props {
  tickets: TicketSummary[];
  /** Base do link de detalhe ("/support" ou "/admin/tickets") */
  basePath: string;
  showRequester?: boolean;
  emptyMessage: string;
}

/** Lista de chamados (server component): links acessíveis, sem depender de hover. */
export function TicketList({ tickets, basePath, showRequester = false, emptyMessage }: Props) {
  if (tickets.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {tickets.map((t) => (
        <li key={t.id}>
          <Link href={`${basePath}/${t.id}`}
            className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{t.protocol}</span>
                <span aria-hidden="true">·</span>
                <span>{TICKET_CATEGORY_LABEL[t.category]}</span>
                {showRequester && t.requesterName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{t.requesterName} ({t.requesterRole === 'PSYCHOLOGIST' ? 'psicólogo' : 'paciente'})</span>
                  </>
                )}
              </div>
              <p className="mt-1 font-semibold text-slate-800 truncate">{t.subject}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Aberto em {formatDateTime(t.createdAt)} · última atividade {formatDateTime(t.lastMessageAt ?? t.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {showRequester && <TicketPriorityBadge priority={t.priority} />}
              <TicketStatusBadge status={t.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
