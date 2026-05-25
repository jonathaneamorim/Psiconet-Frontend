import { searchPatientsAction } from '@/actions/profile';
import { ProfileCard } from '@/components/Organism/ProfileCard';
import { Pagination } from '@/components/Molecules/Pagination';

export default async function PsychologistSearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 0;
  const query = typeof searchParams.query === 'string' ? searchParams.query : '';
  const isSearchActive = query.trim().length > 0;

  let data, error;
  if (isSearchActive) {
    const res = await searchPatientsAction(query, page, 10);
    data = res.data;
    error = res.error;
  }

  const contentList = Array.isArray(data) ? data : (data?.content || []);
  const pageMeta = !Array.isArray(data) && data?.page ? data.page : null;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Buscar Pacientes</h1>
          <p className="text-slate-600">Encontre pacientes na plataforma e envie solicitações de conexão.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <form className="flex gap-4">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Buscar por nome ou cidade..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
            <button type="submit" className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
              Buscar
            </button>
          </form>
        </div>

        {error && isSearchActive ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-200 text-center">
            {error}
          </div>
        ) : !isSearchActive ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Pronto para buscar</h3>
            <p className="text-slate-500 mt-2">Digite um nome ou cidade acima para encontrar pacientes.</p>
          </div>
        ) : contentList.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Nenhum paciente encontrado</h3>
            <p className="text-slate-500 mt-2">Tente buscar por outros termos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {contentList.map((patient: any) => (
              <ProfileCard key={patient.id} profile={patient} profileType="patient" />
            ))}
            
            {pageMeta && (
              <div className="mt-8">
                <Pagination
                  currentPage={pageMeta.number || 0}
                  totalPages={pageMeta.totalPages || 1}
                  totalElements={pageMeta.totalElements || contentList.length}
                  pageSize={pageMeta.size || 10}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
