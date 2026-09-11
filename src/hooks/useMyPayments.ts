'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { PaymentDTO, PaymentStatus } from '@/types/payment';
import type { PaginatedResponse } from '@/types/connection';
import {
  getMyPaymentsAction,
  uploadPaymentReceiptAction,
  approvePaymentAction,
  rejectPaymentAction,
  disputePaymentAction,
} from '@/actions/payments';

interface UseMyPaymentsOptions {
  initialData?: PaginatedResponse<PaymentDTO>;
  perspective: 'psychologist' | 'patient';
}

export function useMyPayments({ initialData, perspective }: UseMyPaymentsOptions) {
  const [payments, setPayments] = useState<PaymentDTO[]>(initialData?.content ?? []);
  const [pageMeta, setPageMeta] = useState(initialData?.page ?? null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [uploadModalPayment, setUploadModalPayment] = useState<PaymentDTO | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<PaymentDTO | null>(null);
  const [disputeModalPayment, setDisputeModalPayment] = useState<PaymentDTO | null>(null);

  const isFirstRender = useRef(true);

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await getMyPaymentsAction(page, 10, status);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setPayments(res.data.content);
        setPageMeta(res.data.page);
        setCurrentPage(page);
      }
      setIsLoading(false);
    },
    [statusFilter]
  );

  const refresh = useCallback(() => fetchPage(currentPage), [fetchPage, currentPage]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updatePayment = (updated: PaymentDTO) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const openUploadModal = (payment: PaymentDTO) => setUploadModalPayment(payment);
  const closeUploadModal = () => setUploadModalPayment(null);
  const openRejectModal = (payment: PaymentDTO) => setRejectModalPayment(payment);
  const closeRejectModal = () => setRejectModalPayment(null);
  const openDisputeModal = (payment: PaymentDTO) => setDisputeModalPayment(payment);
  const closeDisputeModal = () => setDisputeModalPayment(null);

  const handleUploadReceipt = async (file: File) => {
    if (!uploadModalPayment) return false;
    setIsMutating(true);
    try {
      const res = await uploadPaymentReceiptAction(uploadModalPayment.id, file);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Comprovante enviado com sucesso!');
      if (res.data) updatePayment(res.data);
      closeUploadModal();
      return true;
    } catch {
      toast.error('Erro ao enviar comprovante.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setIsMutating(true);
    try {
      const res = await approvePaymentAction(paymentId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Pagamento aprovado com sucesso!');
      if (res.data) updatePayment(res.data);
    } catch {
      toast.error('Erro ao aprovar pagamento.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectModalPayment) return false;
    setIsMutating(true);
    try {
      const res = await rejectPaymentAction(rejectModalPayment.id, reason);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Pagamento rejeitado.');
      if (res.data) updatePayment(res.data);
      closeRejectModal();
      return true;
    } catch {
      toast.error('Erro ao rejeitar pagamento.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleDispute = async (message: string) => {
    if (!disputeModalPayment) return false;
    setIsMutating(true);
    try {
      const res = await disputePaymentAction(disputeModalPayment.id, message);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Contestação enviada com sucesso!');
      if (res.data) updatePayment(res.data);
      closeDisputeModal();
      return true;
    } catch {
      toast.error('Erro ao enviar contestação.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    payments,
    pageMeta,
    currentPage,
    statusFilter,
    isLoading,
    isMutating,
    perspective,
    uploadModalPayment,
    rejectModalPayment,
    disputeModalPayment,
    setStatusFilter,
    fetchPage,
    refresh,
    openUploadModal,
    closeUploadModal,
    openRejectModal,
    closeRejectModal,
    openDisputeModal,
    closeDisputeModal,
    handleUploadReceipt,
    handleApprove,
    handleReject,
    handleDispute,
  };
}
