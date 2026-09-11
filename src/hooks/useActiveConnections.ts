'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { ActiveConnectionDTO, PaginatedResponse } from '@/types/connection';
import { getActiveConnectionsAction } from '@/actions/connections';
import { removeConnectionAction } from '@/actions/connections';
import { updateTreatmentLinkPriceAction } from '@/actions/treatmentLinks';

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
    const previous = [...connections];
    setConnections((prev) => prev.filter((c) => c.connectionId !== connectionId));

    startTransition(async () => {
      const result = await removeConnectionAction(connectionId);
      if (result.error) {
        setConnections(previous);
        toast.error(result.error);
      } else {
        toast.success('Conexão removida com sucesso.');
        setPageMeta((prev) =>
          prev ? { ...prev, totalElements: Math.max(0, prev.totalElements - 1) } : prev
        );
      }
    });
  }, [connections]);

  const updatePrice = useCallback(
    async (treatmentLinkId: string, price: number): Promise<boolean> => {
      const result = await updateTreatmentLinkPriceAction(treatmentLinkId, price);
      if (result.error) {
        toast.error(result.error);
        return false;
      }

      setConnections((prev) =>
        prev.map((c) =>
          c.user.treatmentLinkId === treatmentLinkId
            ? { ...c, user: { ...c.user, defaultPrice: price } }
            : c
        )
      );
      toast.success('Preço padrão atualizado com sucesso.');
      return true;
    },
    []
  );

  return {
    connections,
    pageMeta,
    currentPage,
    isLoading,
    isMutating: isPending,
    error,
    fetchPage,
    disconnect,
    updatePrice,
  };
}
