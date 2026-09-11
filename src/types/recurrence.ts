import type { LocationDTO, MeetingProvider, MeetingType } from '@/types/appointment';

export type RecurrenceFrequency =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY'
  | 'FIRST_DAY_OF_MONTH'
  | 'LAST_DAY_OF_MONTH'
  | 'EVERY_N_DAYS';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface RecurrenceRuleDTO {
  id: string;
  frequency: RecurrenceFrequency;
  dayOfWeek?: DayOfWeek;
  intervalDays?: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate?: string;
  title?: string;
  meetingType: MeetingType;
  meetingProvider?: MeetingProvider;
  meetingLink?: string;
  location?: LocationDTO;
  price?: number;
  adjustForWeekend: boolean;
  isActive?: boolean;
}

export interface RecurrenceRuleCreateDTO {
  frequency: RecurrenceFrequency;
  dayOfWeek?: DayOfWeek;
  intervalDays?: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate?: string;
  title?: string;
  meetingType: MeetingType;
  meetingLink?: string;
  location?: LocationDTO;
  price?: number;
  adjustForWeekend: boolean;
}
