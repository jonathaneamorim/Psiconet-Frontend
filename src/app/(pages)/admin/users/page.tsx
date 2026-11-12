import { getUsersAction } from '@/actions/admin';
import { UsersTable } from '@/components/Organism/UsersTable';
import { Pagination } from '@/components/Molecules/Pagination';
import { AdminPageHeader } from '@/components/Organism/AdminPageHeader';
import { AdminUsersToolbar } from '@/components/Organism/AdminUsersToolbar';
import type { UserRole, UserStatus } from '@/types/admin';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gerenciar Usuários | Psiconet Admin',
  description: 'Gerencie todos os usuários da plataforma Psiconet — pacientes, psicólogos e administradores.',
};

const PAGE_SIZE = 20;
const ROLES: { value: UserRole; label: string }[] = [
  { value: 'PATIENT', label: 'Pacientes' },
  { value: 'PSYCHOLOGIST', label: 'Psicólogos' },
  { value: 'ADMIN', label: 'Administradores' },
];
const STATUSES: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'INACTIVE', label: 'Inativos' },
  { value: 'BLOCKED', label: 'Bloqueados' },
  { value: 'PENDING_VERIFICATION', label: 'Pendentes' },
];
const SORTS = [
  { value: 'fullName', label: 'Nome (A–Z)' },
  { value: 'createdAt,desc', label: 'Mais recentes' },
  { value: 'createdAt,asc', label: 'Mais antigos' },
];

interface Props {
  searchParams: Promise<{ page?: string; sort?: string; search?: string; role?: string; status?: string }>;
}

const selectClass = 'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0) || 0);
  const sort = SORTS.some((s) => s.value === params.sort) ? params.sort! : 'fullName';
  const search = (params.search ?? '').slice(0, 100);
  const role = ROLES.some((r) => r.value === params.role) ? (params.role as UserRole) : '';
  const status = STATUSES.some((s) => s.value === params.status) ? (params.status as UserStatus) : '';

  const { data, error } = await getUsersAction({ page, size: PAGE_SIZE, sort, search, role, status });
  const hasFilters = Boolean(search || role || status);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminPageHeader
          section="Usuários"
          title="Usuários"
          description="Resolva problemas de cadastro, ative ou inative contas e envie comunicados."
          actions={<AdminUsersToolbar />}
        />

        {/* Filtros (aplicados no servidor via query string) */}
        <form method="get" role="search" className="flex flex-col lg:flex-row gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <label className="flex-1">
            <span className="sr-only">Buscar por nome ou e-mail</span>
            <input name="search" defaultValue={search} placeholder="Buscar por nome ou e-mail" maxLength={100}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </label>
          <label>
            <span className="sr-only">Perfil</span>
            <select name="role" defaultValue={role} className={selectClass}>
              <option value="">Todos os perfis</option>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Situação</span>
            <select name="status" defaultValue={status} className={selectClass}>
              <option value="">Todas as situações</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Ordenação</span>
            <select name="sort" defaultValue={sort} className={selectClass}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">
              Filtrar
            </button>
            {hasFilters && (
              <Link href="/admin/users" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Limpar
              </Link>
            )}
          </div>
        </form>

        {error && (
          <div role="alert" className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">
                {hasFilters ? 'Resultados da busca' : 'Todos os usuários'}
              </span>
              <span className="text-xs text-slate-500">{data.page.totalElements} usuário(s)</span>
            </div>

            <UsersTable users={data.content} />

            <Pagination
              currentPage={data.page.number}
              totalPages={data.page.totalPages}
              totalElements={data.page.totalElements}
              pageSize={PAGE_SIZE}
              query={{ search, role, status, sort }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
