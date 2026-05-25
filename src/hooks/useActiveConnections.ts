'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { ActiveConnectionDTO, PaginatedResponse } from '@/types/connection';
import { getActiveConnectionsAction } from '@/actions/connections';
import { removeConnectionAction } from '@/actions/connections';

interface UseActiveConnectionsOptions {
  initialData?: PaginatedResponse<ActiveConnectionDTO>;
  initialPage?: number;
}

export function useActiveConnections({
  initialData,
  initialPage = 0,
}: UseActiveConnectionsOptions = {}) {
  const [connections, setConnections] = useState<ActiveConnectionDTO[]>(
    initialData?.content ?? []
  );
  const [pageMeta, setPageMeta] = useState(initialData?.page ?? null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData?.content) {
      setConnections(initialData.content);
      setPageMeta(initialData.page);
    }
  }, [initialData]);

  const fetchPage = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    const result = await getActiveConnectionsAction(page, 10);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setConnections(result.data.content);
      setPageMeta(result.data.page);
      setCurrentPage(page);
    }
    setIsLoading(false);
  }, []);

  const disconnect = useCallback((connectionId: string) => {
    // Optimistic removal
    const previous = [...connections];
    setConnections((prev) => prev.filter((c) => c.connectionId !== connectionId));

    startTransition(async () => {
      const result = await removeConnectionAction(connectionId);
      if (result.error) {
        // Rollback on failure
        setConnections(previous);
        toast.error(result.error);
      } else {
        toast.success('Conexão removida com sucesso.');
        // Update total elements count optimistically
        setPageMeta((prev) =>
          prev ? { ...prev, totalElements: Math.max(0, prev.totalElements - 1) } : prev
        );
      }
    });
  }, [connections]);

  return {
    connections,
    pageMeta,
    currentPage,
    isLoading,
    isMutating: isPending,
    error,
    fetchPage,
    disconnect,
  };
}
