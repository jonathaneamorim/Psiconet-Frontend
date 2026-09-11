export type NotificationReferenceType =
  | 'APPOINTMENT'
  | 'CONNECTION'
  | 'PAYMENT'
  | string;

export type NotificationType =
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_CANCELLED'
  | 'CONNECTION_REQUESTED'
  | 'CONNECTION_ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIPT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'PAYMENT_DISPUTED';

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
}
