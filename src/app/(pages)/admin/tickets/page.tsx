import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminTicketsAction } from '@/actions/tickets';
import { TicketList } from '@/components/Organism/TicketList';
import { Pagination } from '@/components/Molecules/Pagination';
import { AdminPageHeader } from '@/components/Organism/AdminPageHeader';
import {
  TICKET_CATEGORY_LABEL,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '@/types/ticket';

export const metadata: Metadata = { title: 'Chamados | Psiconet Admin' };

interface Props {
  searchParams: Promise<{ page?: string; status?: string; priority?: string; category?: string; search?: string }>;
}

const pick = <T extends string>(value: string | undefined, options: Record<T, string>): T | '' =>
  value && value in options ? (value as T) : '';

const selectClass = 'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

export default async function AdminTicketsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0) || 0);
  const status = pick<TicketStatus>(params.status, TICKET_STATUS_LABEL);
  const priority = pick<TicketPriority>(params.priority, TICKET_PRIORITY_LABEL);
  const category = pick<TicketCategory>(params.category, TICKET_CATEGORY_LABEL);
  const search = (params.search ?? '').slice(0, 100);

  const { data, error } = await getAdminTicketsAction({ page, status, priority, category, search });
  const hasFilters = Boolean(status || priority || category || search);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminPageHeader section="Chamados" title="Chamados de suporte"
          description="Responda e finalize os chamados de pacientes e psicólogos. Respostas e finalizações notificam o usuário." />

        <form method="get" role="search" className="flex flex-col lg:flex-row gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <label className="flex-1">
            <span className="sr-only">Buscar</span>
            <input name="search" defaultValue={search} maxLength={100} placeholder="Protocolo, assunto, nome ou e-mail"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </label>
          <label><span className="sr-only">Situação</span>
            <select name="status" defaultValue={status} className={selectClass}>
              <option value="">Todas as situações</option>
              {(Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => <option key={s} value={s}>{TICKET_STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Prioridade</span>
            <select name="priority" defaultValue={priority} className={selectClass}>
              <option value="">Todas as prioridades</option>
              {(Object.keys(TICKET_PRIORITY_LABEL) as TicketPriority[]).map((p) => <option key={p} value={p}>{TICKET_PRIORITY_LABEL[p]}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Categoria</span>
            <select name="category" defaultValue={category} className={selectClass}>
              <option value="">Todas as categorias</option>
              {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map((c) => <option key={c} value={c}>{TICKET_CATEGORY_LABEL[c]}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">Filtrar</button>
            {hasFilters && <Link href="/admin/tickets" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Limpar</Link>}
          </div>
        </form>

        {error && <div role="alert" className="px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">{error}</div>}

        {data && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <TicketList tickets={data.content} basePath="/admin/tickets" showRequester
              emptyMessage={hasFilters ? 'Nenhum chamado com esses filtros.' : 'Nenhum chamado aberto até agora.'} />
            <Pagination currentPage={data.page.number} totalPages={data.page.totalPages} totalElements={data.page.totalElements}
              pageSize={20} query={{ status, priority, category, search }} itemLabel="chamados" />
          </div>
        )}
      </div>
    </div>
  );
}
