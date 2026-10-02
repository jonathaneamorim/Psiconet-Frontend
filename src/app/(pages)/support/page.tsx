import type { Metadata } from 'next';
import Link from 'next/link';
import { getMyTicketsAction } from '@/actions/tickets';
import { TicketList } from '@/components/Organism/TicketList';
import { Pagination } from '@/components/Molecules/Pagination';
import { TICKET_STATUS_LABEL, type TicketStatus } from '@/types/ticket';

export const metadata: Metadata = { title: 'Meus chamados | Psiconet' };

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const STATUSES = Object.keys(TICKET_STATUS_LABEL) as TicketStatus[];

export default async function SupportPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0) || 0);
  const status = STATUSES.includes(params.status as TicketStatus) ? (params.status as TicketStatus) : '';
  const { data, error } = await getMyTicketsAction(page, status);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Meus chamados</h1>
            <p className="text-slate-600 mt-1">Fale com a equipe Psiconet sobre acesso, cadastro, agenda ou cobranças.</p>
          </div>
          <Link href="/support/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl shadow-sm">
            Abrir chamado
          </Link>
        </div>

        <nav aria-label="Filtrar por situação" className="flex gap-2 overflow-x-auto pb-1">
          {[{ value: '', label: 'Todos' }, ...STATUSES.map((s) => ({ value: s, label: TICKET_STATUS_LABEL[s] }))].map((f) => {
            const active = f.value === status;
            return (
              <Link key={f.value || 'all'} href={f.value ? `/support?status=${f.value}` : '/support'}
                aria-current={active ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {f.label}
              </Link>
            );
          })}
        </nav>

        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

        {data && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <TicketList tickets={data.content} basePath="/support"
              emptyMessage={status ? 'Nenhum chamado com esta situação.' : 'Você ainda não abriu nenhum chamado.'} />
            <Pagination currentPage={data.page.number} totalPages={data.page.totalPages}
              totalElements={data.page.totalElements} pageSize={10} query={{ status }} itemLabel="chamados" />
          </div>
        )}
      </div>
    </div>
  );
}
