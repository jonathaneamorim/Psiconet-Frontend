import type { PersonSummaryDTO } from '@/types/appointment';

export interface VideoConfigDTO {
  enabled: boolean;
}

/** Credencial de entrada (token curto: mantenha SOMENTE em memória, nunca em storage/URL). */
export interface VideoJoinResponseDTO {
  appointmentId: string;
  provider: string;
  serverUrl: string;
  token: string;
  tokenExpiresAt: string;
  identity: string;
  role: 'HOST' | 'GUEST';
  remoteIdentity: string;
  remoteParticipant: PersonSummaryDTO;
  startDateTime: string;
  endDateTime: string;
  joinClosesAt: string;
}
