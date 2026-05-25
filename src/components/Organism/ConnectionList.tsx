'use client';

import { useState } from 'react';
import type { ActiveConnectionDTO, PaginatedResponse } from '@/types/connection';
import { useActiveConnections } from '@/hooks/useActiveConnections';
import { ConnectionCard } from './ConnectionCard';
import { EmptyConnectionsState } from './EmptyConnectionsState';
import { ConfirmModal } from '../Molecules/ConfirmModal';

interface ConnectionListProps {
  initialData?: PaginatedResponse<ActiveConnectionDTO>;
  initialPage?: number;
  searchHref: string;
  searchLabel: string;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ConnectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-5 animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 flex-shrink-0 self-center sm:self-start" />
      <div className="flex-1 flex flex-col gap-3 justify-center">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        <div className="h-4 w-32 bg-slate-100 rounded-lg" />
        <div className="h-4 w-40 bg-slate-100 rounded-lg" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 bg-slate-100 rounded-md" />
          <div className="h-5 w-20 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="flex gap-2 sm:flex-col">
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center flex flex-col items-center gap-4">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-red-700">{message}</p>
        <p className="text-sm text-red-500 mt-1">Verifique sua conexão e tente novamente.</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────

function PaginationBar({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 4) pages.push('...');
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white rounded-b-2xl">
      <p className="text-xs text-slate-400">
        Exibindo <span className="font-medium text-slate-600">{start}–{end}</span> de{' '}
        <span className="font-medium text-slate-600">{totalElements}</span> conexões
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginação de conexões">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConnectionList({
  initialData,
  initialPage = 0,
  searchHref,
  searchLabel,
}: ConnectionListProps) {
  const {
    connections,
    pageMeta,
    currentPage,
    isLoading,
    isMutating,
    error,
    fetchPage,
    disconnect,
  } = useActiveConnections({ initialData, initialPage });

  // Disconnect modal state
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(null);

  function handleDisconnectRequest(connectionId: string) {
    setPendingDisconnectId(connectionId);
  }

  function handleDisconnectConfirm() {
    if (pendingDisconnectId) {
      disconnect(pendingDisconnectId);
      setPendingDisconnectId(null);
    }
  }

  function handleDisconnectCancel() {
    setPendingDisconnectId(null);
  }

  return (
    <>
      {/* Error state */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={() => fetchPage(currentPage)} />
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ConnectionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && connections.length === 0 && (
        <EmptyConnectionsState searchHref={searchHref} searchLabel={searchLabel} />
      )}

      {/* Connection list */}
      {!isLoading && !error && connections.length > 0 && (
        <div className="flex flex-col gap-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.connectionId}
              connection={connection}
              onDisconnect={handleDisconnectRequest}
              isMutating={isMutating}
            />
          ))}

          {pageMeta && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={pageMeta.totalPages}
              totalElements={pageMeta.totalElements}
              pageSize={pageMeta.size}
              onPageChange={fetchPage}
            />
          )}
        </div>
      )}

      {/* Disconnect confirmation modal */}
      {pendingDisconnectId && (
        <ConfirmModal
          title="Remover Conexão"
          description="Tem certeza que deseja remover esta conexão? Esta ação não pode ser desfeita."
          confirmLabel="Sim, remover"
          confirmVariant="danger"
          onConfirm={handleDisconnectConfirm}
          onClose={handleDisconnectCancel}
        />
      )}
    </>
  );
}
