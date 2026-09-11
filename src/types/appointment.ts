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
}

export interface AppointmentCreateDTO {
  patientId: string;
  startDateTime: string;
  endDateTime?: string;
  title?: string;
  description?: string;
  meetingType: MeetingType;
  meetingLink?: string;
  location?: LocationDTO;
  price?: number;
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
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: AppointmentDTO[];
}
