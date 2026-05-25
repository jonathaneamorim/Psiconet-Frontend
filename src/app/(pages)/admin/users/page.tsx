import { getUsersAction } from '@/actions/admin';
import { UsersTable } from '@/components/Organism/UsersTable';
import { Pagination } from '@/components/Molecules/Pagination';
import { SortSelect } from '@/components/Molecules/SortSelect';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gerenciar Usuários | Psiconet Admin',
  description: 'Gerencie todos os usuários da plataforma Psiconet — pacientes, psicólogos e administradores.',
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? 0));
  const sort = params.sort ?? 'fullName';

  const { data, error } = await getUsersAction(page, PAGE_SIZE, sort);

  return (
    <main className="min-h-screen bg-slate-50 pl-16 pt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Cabeçalho da página */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Admin</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-600 font-medium">Usuários</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
              <p className="text-sm text-slate-500 mt-1">
                Gerencie todos os usuários cadastrados na plataforma.
              </p>
            </div>

            {data && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-slate-700">{data.page.totalElements}</span>
                <span className="text-xs text-slate-400">usuários</span>
              </div>
            )}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Card da tabela */}
        {data && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">
                  Todos os usuários
                </span>
              </div>

              {/* <SortSelect /> */}
            </div>

            {/* Tabela */}
            <UsersTable users={data.content} />

            {/* Paginação */}
            <Pagination
              currentPage={data.page.number}
              totalPages={data.page.totalPages}
              totalElements={data.page.totalElements}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>
    </main>
  );
}
