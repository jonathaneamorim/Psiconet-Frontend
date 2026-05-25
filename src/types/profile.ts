import { UserRole, UserStatus } from './admin';

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
