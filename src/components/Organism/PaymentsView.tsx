'use client';

import { useState, useEffect } from 'react';
import type { PaymentDTO, PaymentStatus } from '@/types/payment';
import type { AppointmentDTO } from '@/types/appointment';
import type { PaginatedResponse } from '@/types/connection';
import { useMyPayments } from '@/hooks/useMyPayments';
import { getMyAppointmentsAction } from '@/actions/appointments';
import { PaymentStatusBadge } from '@/components/Atoms/PaymentStatusBadge';
import { UploadReceiptModal } from '@/components/Molecules/UploadReceiptModal';
import { RejectPaymentModal } from '@/components/Molecules/RejectPaymentModal';
import { DisputePaymentModal } from '@/components/Molecules/DisputePaymentModal';
import { formatAppointmentDate } from '@/lib/calendar';

interface Props {
  initialData?: PaginatedResponse<PaymentDTO>;
  perspective: 'psychologist' | 'patient';
}

const FILTER_OPTIONS: { value: PaymentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'AWAITING_REVIEW', label: 'Em Análise' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'DISPUTED', label: 'Contestados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function PaymentsView({ initialData, perspective }: Props) {
  const {
    payments,
    pageMeta,
    currentPage,
    statusFilter,
    isLoading,
    isMutating,
    uploadModalPayment,
    rejectModalPayment,
    disputeModalPayment,
    setStatusFilter,
    fetchPage,
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
  } = useMyPayments({ initialData, perspective });

  // A camada de pagamento não expõe a consulta relacionada (apenas o id) — busca os
  // agendamentos do usuário em paralelo para enriquecer a exibição (data e outra pessoa).
  const [appointmentsById, setAppointmentsById] = useState<Map<string, AppointmentDTO>>(new Map());

  useEffect(() => {
    getMyAppointmentsAction(0, 200).then((res) => {
      if (res.data?.content) {
        setAppointmentsById(new Map(res.data.content.map((a) => [a.id, a])));
      }
    });
  }, []);

  const isPsychologist = perspective === 'psychologist';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${statusFilter === option.value
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[var(--primary)] flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhuma cobrança encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {statusFilter === 'ALL'
              ? 'Suas cobranças aparecerão aqui conforme as consultas forem realizadas.'
              : 'Nenhuma cobrança com este status.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => {
            const appointment = appointmentsById.get(payment.appointmentId);
            const otherPerson = appointment
              ? (isPsychologist ? appointment.patient : appointment.psychologist)
              : undefined;

            return (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PaymentStatusBadge status={payment.status} />
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(payment.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {appointment ? (
                      <>
                        Consulta em {formatAppointmentDate(appointment.startDateTime)}
                        {otherPerson && <> com <span className="font-medium text-slate-700">{otherPerson.fullName}</span></>}
                      </>
                    ) : (
                      `Referente à consulta #${payment.appointmentId.slice(0, 8)}`
                    )}
                  </p>
                  {payment.status === 'REJECTED' && payment.rejectionReason && (
                    <p className="text-xs text-red-600 italic">Motivo da rejeição: "{payment.rejectionReason}"</p>
                  )}
                  {payment.status === 'DISPUTED' && payment.disputeMessage && (
                    <p className="text-xs text-violet-600 italic">Contestação: "{payment.disputeMessage}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {payment.receiptUrl && (
                    <a
                      href={`/api/payments/${payment.id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                    >
                      Ver Comprovante
                    </a>
                  )}

                  {!isPsychologist && (payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                    <button
                      onClick={() => openUploadModal(payment)}
                      disabled={isMutating}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-colors disabled:opacity-50"
                    >
                      Enviar Comprovante
                    </button>
                  )}

                  {!isPsychologist && payment.status === 'REJECTED' && (
                    <button
                      onClick={() => openDisputeModal(payment)}
                      disabled={isMutating}
                      className="px-3.5 py-2 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Contestar
                    </button>
                  )}

                  {isPsychologist && (payment.status === 'AWAITING_REVIEW' || payment.status === 'DISPUTED') && (
                    <>
                      <button
                        onClick={() => handleApprove(payment.id)}
                        disabled={isMutating}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => openRejectModal(payment)}
                        disabled={isMutating}
                        className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {pageMeta && pageMeta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500">
                Página {currentPage + 1} de {pageMeta.totalPages}
              </span>
              <button
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage >= pageMeta.totalPages - 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      <UploadReceiptModal
        isOpen={!!uploadModalPayment}
        isMutating={isMutating}
        onClose={closeUploadModal}
        onConfirm={handleUploadReceipt}
      />

      <RejectPaymentModal
        isOpen={!!rejectModalPayment}
        isMutating={isMutating}
        onClose={closeRejectModal}
        onConfirm={handleReject}
      />

      <DisputePaymentModal
        isOpen={!!disputeModalPayment}
        isMutating={isMutating}
        onClose={closeDisputeModal}
        onConfirm={handleDispute}
      />
    </div>
  );
}
