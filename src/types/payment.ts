export type PaymentStatus =
  | 'PENDING'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'CANCELLED';

export type PaymentTiming = 'BEFORE_APPOINTMENT' | 'AFTER_APPOINTMENT';

export type PaymentAdvanceUnit = 'MINUTES' | 'DAYS';

export interface PaymentDTO {
  id: string;
  appointmentId: string;
  amount: number;
  status: PaymentStatus;
  receiptUrl?: string;
  rejectionReason?: string;
  disputeMessage?: string;
  receiptUploadedAt?: string;
  reviewedAt?: string;
}

export interface BillingSettingsUpdateDTO {
  pixKey?: string;
  paymentTiming?: PaymentTiming;
  // Usados só quando paymentTiming = 'BEFORE_APPOINTMENT'.
  paymentAdvanceValue?: number;
  paymentAdvanceUnit?: PaymentAdvanceUnit;
}

/* GET /payments/summary?year=&month= — resumo financeiro do mês (psicólogo: a receber/recebido; paciente: a pagar/pago) */
export interface FinancialSummaryDTO {
  year: number;
  month: number;
  confirmedCount: number;
  confirmedAmount: number;
  awaitingReviewCount: number;
  awaitingReviewAmount: number;
  pendingCount: number;
  pendingAmount: number;
  disputedCount: number;
  disputedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  outstandingCount: number;
  outstandingAmount: number;
  totalExpectedAmount: number;
}
