export type NotificationReferenceType =
  | 'APPOINTMENT'
  | 'CONNECTION'
  | 'PAYMENT'
  | 'TICKET'
  | 'ANNOUNCEMENT'
  | 'MEDICAL_RECORD'
  | 'LEGAL'
  | string;

export type NotificationType =
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_CANCELLED'
  | 'VIDEO_SESSION_REMINDER'
  | 'VIDEO_PARTICIPANT_JOINED'
  /** Ocorrência recorrente gerada sobre outra consulta (só psicólogo; texto só com data/hora). */
  | 'SCHEDULE_OVERLAP'
  | 'CONNECTION_REQUESTED'
  | 'CONNECTION_ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIPT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'PAYMENT_DISPUTED'
  | 'TICKET_REPLIED'
  | 'TICKET_CLOSED'
  | 'ADMIN_ANNOUNCEMENT'
  | 'MEDICAL_RECORD_ACCESS_REQUESTED'
  | 'MEDICAL_RECORD_ACCESS_GRANTED'
  | 'MEDICAL_RECORD_ACCESS_DENIED'
  | 'LEGAL_DOCUMENTS_UPDATED';

export interface NotificationDTO {
  id: string;
  type?: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType: NotificationReferenceType;
  isRead: boolean;
  createdAt: string;
}

export type UnreadCount = number;

export interface NotificationPreferenceDTO {
  appointmentEnabled: boolean;
  connectionEnabled: boolean;
  paymentEnabled: boolean;
  /** Somente leitura: categorias que não podem ser desativadas (SUPPORT, ANNOUNCEMENT, MEDICAL_RECORD) */
  mandatoryCategories?: string[];
}
