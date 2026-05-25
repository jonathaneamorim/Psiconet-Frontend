'use client';

import Link from 'next/link';

interface Props {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export function Pagination({ currentPage, totalPages, totalElements, pageSize }: Props) {
  // Guard against undefined/NaN values coming from the backend
  const safeCurrent = Number.isFinite(currentPage) ? currentPage : 0;
  const safeTotal = Number.isFinite(totalPages) ? totalPages : 0;
  const safeElements = Number.isFinite(totalElements) ? totalElements : 0;

  const start = safeCurrent * pageSize + 1;
  const end = Math.min((safeCurrent + 1) * pageSize, safeElements);

  function buildHref(page: number) {
    return `?page=${page}`;
  }

  // Gera array de páginas visíveis (máx 7 ao redor da atual)
  const pages: (number | '...')[] = [];
  if (safeTotal <= 7) {
    for (let i = 0; i < safeTotal; i++) pages.push(i);
  } else {
    pages.push(0);
    if (safeCurrent > 3) pages.push('...');
    for (
      let i = Math.max(1, safeCurrent - 1);
      i <= Math.min(safeTotal - 2, safeCurrent + 1);
      i++
    ) {
      pages.push(i);
    }
    if (safeCurrent < safeTotal - 4) pages.push('...');
    pages.push(safeTotal - 1);
  }

  if (safeTotal <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
      {/* Contagem */}
      <p className="text-xs text-slate-400">
        Exibindo <span className="font-medium text-slate-600">{start}–{end}</span> de{' '}
        <span className="font-medium text-slate-600">{safeElements}</span> usuários
      </p>

      {/* Navegação */}
      <nav className="flex items-center gap-1" aria-label="Paginação">
        {/* Anterior */}
        {safeCurrent > 0 ? (
          <Link
            href={buildHref(safeCurrent - 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Página anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
        )}

        {/* Números */}
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                page === safeCurrent
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-current={page === safeCurrent ? 'page' : undefined}
            >
              {String(page + 1)}
            </Link>
          )
        )}

        {/* Próxima */}
        {safeCurrent < safeTotal - 1 ? (
          <Link
            href={buildHref(safeCurrent + 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Próxima página"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </nav>
    </div>
  );
}
