import Link from 'next/link';

interface EmptyConnectionsStateProps {
  searchHref: string;
  searchLabel: string;
}

export function EmptyConnectionsState({ searchHref, searchLabel }: EmptyConnectionsStateProps) {
  return (
    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center gap-4">
      {/* Illustration */}
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-700">Nenhuma conexão ainda</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Você ainda não tem conexões ativas. Explore e conecte-se com outros usuários.
        </p>
      </div>

      <Link
        href={searchHref}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        {searchLabel}
      </Link>
    </div>
  );
}
