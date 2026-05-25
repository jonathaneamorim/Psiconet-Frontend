import { getActiveConnectionsAction } from '@/actions/connections';
import { ConnectionList } from '@/components/Organism/ConnectionList';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Minhas Conexões | Psiconet',
  description: 'Gerencie suas conexões ativas na plataforma Psiconet.',
};

export default async function PatientConnectionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(0, Number(searchParams.page) || 0);

  const { data, error } = await getActiveConnectionsAction(page, 10);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Minhas Conexões</h1>
          <p className="text-slate-600">
            Visualize e gerencie seus psicólogos conectados na plataforma.
          </p>
        </div>

        {/* Stats bar */}
        {data && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {data.page.totalElements}{' '}
                {data.page.totalElements === 1 ? 'conexão ativa' : 'conexões ativas'}
              </p>
              <p className="text-xs text-slate-400">Psicólogos conectados a você</p>
            </div>
          </div>
        )}

        {/* Server error banner (non-blocking) */}
        {error && !data && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm mb-6">
            {error}
          </div>
        )}

        <ConnectionList
          initialData={data}
          initialPage={page}
          searchHref={ROUTES.PATIENT_SEARCH}
          searchLabel="Buscar Psicólogos"
        />
      </div>
    </div>
  );
}
