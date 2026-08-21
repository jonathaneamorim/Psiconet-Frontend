export type AppointmentStatus = 'SCHEDULED' | 'ACCEPTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

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
}

export interface AppointmentCancelDTO {
  reason?: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: AppointmentDTO[];
}
