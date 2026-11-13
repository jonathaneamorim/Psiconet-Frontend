import type { RecurrenceFrequency } from '@/types/recurrence';

export type AppointmentStatus = 'ACCEPTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type MeetingType = 'IN_PERSON' | 'VIDEO_CALL';

export type MeetingProvider = 'EXTERNAL_LINK' | 'IN_APP';

export interface LocationDTO {
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
  country?: string;
}

export interface PersonSummaryDTO {
  id: string;
  fullName: string;
  photoUrl?: string;
}

export interface AppointmentDTO {
  id: string;
  title?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  meetingType: MeetingType;
  meetingProvider?: MeetingProvider;
  meetingLink?: string;
  location?: LocationDTO;
  status: AppointmentStatus;
  cancelledBy?: 'PATIENT' | 'PSYCHOLOGIST';
  cancellationReason?: string;
  price?: number;
  recurrenceRuleId?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  patient: PersonSummaryDTO;
  psychologist: PersonSummaryDTO;
  createdAt: string;
  /** Janela de entrada na sala integrada (só VIDEO_CALL + IN_APP), calculada pelo backend. */
  joinOpensAt?: string;
  joinClosesAt?: string;
  /**
   * Sobreposição de horário (ADR 019 do backend), calculada a cada leitura. Só existe na visão do
   * PSICÓLOGO dono; para o paciente o backend nem envia estes campos.
   */
  hasOverlap?: boolean;
  overlappingAppointments?: OverlapSummary[];
}

/** Outra consulta no mesmo horário — com o nome do paciente, só para o psicólogo dono da agenda. */
export interface OverlapSummary {
  id: string;
  startDateTime: string;
  endDateTime: string;
  title?: string;
  patientName: string;
}

/** Ocorrência de série recorrente que coincide com outra consulta (preview de sobreposição). */
export interface RecurrenceOccurrenceOverlap {
  startDateTime: string;
  endDateTime: string;
  overlappingAppointments: OverlapSummary[];
}

/** Código do 409 quando o horário já está ocupado e o psicólogo ainda não confirmou. */
export const SCHEDULE_OVERLAP_CODE = 'SCHEDULE_OVERLAP';

/** Resultado de criar consulta/série na tela: sucesso, falha já avisada, ou horário ocupado a confirmar. */
export type CreateOutcome = boolean | void | { overlapConflicts: OverlapSummary[] };

export function isOverlapOutcome(outcome: CreateOutcome): outcome is { overlapConflicts: OverlapSummary[] } {
  return typeof outcome === 'object' && outcome !== null && Array.isArray(outcome.overlapConflicts);
}

export interface AppointmentCreateDTO {
  patientId: string;
  startDateTime: string;
  endDateTime?: string;
  title?: string;
  description?: string;
  meetingType: MeetingType;
  /** Só para VIDEO_CALL. IN_APP = Sala Psiconet (sem link); EXTERNAL_LINK = Meet/Zoom (link obrigatório). */
  meetingProvider?: MeetingProvider;
  meetingLink?: string;
  location?: LocationDTO;
  price?: number;
  /** Confirma a criação mesmo com outra consulta no horário (sem isso: 409 SCHEDULE_OVERLAP). */
  acknowledgeOverlap?: boolean;
}

export type AppointmentCancelScope = 'SINGLE' | 'THIS_AND_FOLLOWING' | 'ALL_SERIES';

export interface AppointmentCancelDTO {
  reason?: string;
  cancelScope?: AppointmentCancelScope;
}

export interface AppointmentStatsDTO {
  accepted: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

// Ocorrência futura de uma série recorrente ainda não materializada como Appointment real
// (calculada via preview da RecurrenceRule, só para exibição no calendário).
export interface VirtualOccurrence {
  recurrenceRuleId: string;
  frequency: RecurrenceFrequency;
  startDateTime: string;
  /** Psicólogo: a data coincide com outra consulta da agenda. */
  hasOverlap?: boolean;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: AppointmentDTO[];
}
