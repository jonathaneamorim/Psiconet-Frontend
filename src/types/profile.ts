import { UserRole, UserStatus } from './admin';
import type { PaymentAdvanceUnit, PaymentTiming } from './payment';
import type { LocationDTO } from './appointment';

export interface UserProfile {
  id: string;
  email?: string;
  fullName: string | null;
  photoUrl: string | null;
  role: UserRole;
  status: UserStatus;
  connectionStatus?: ConnectionStatus;
  connectionId?: string;
}

export interface PsychologistProfile extends UserProfile {
  crp: string;
  specialties: string[];
  experienceTime?: string;
  description?: string;
  city?: string;
  state?: string;
}

export interface PatientProfile extends UserProfile {
  city?: string;
  state?: string;
}

export type ConnectionStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';

/* Retorno completo de GET /psychologists/me — usado na tela de Configurações */
export interface PsychologistMeProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  crp: string;
  description?: string;
  officeAddress?: LocationDTO;
  pixKey?: string;
  paymentTiming?: PaymentTiming;
  paymentAdvanceValue?: number;
  paymentAdvanceUnit?: PaymentAdvanceUnit;
}

/* Retorno completo de GET /patients/me — usado na tela de Configurações */
export interface PatientMeProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
}

export interface ProfileUpdateDTO {
  fullName: string;
  phone?: string;
  description?: string;
  officeAddress?: LocationDTO;
}

export interface PatientProfileUpdateDTO {
  fullName: string;
  phone?: string;
}
