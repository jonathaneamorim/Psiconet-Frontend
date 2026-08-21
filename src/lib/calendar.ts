import type { AppointmentDTO } from '@/types/appointment';

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEK_DAYS_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function parseISODate(iso: string): Date {
  return new Date(iso);
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatAppointmentDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()];
    const weekDay = WEEK_DAYS_FULL[d.getDay()];
    return `${weekDay}, ${day} de ${month}`;
  } catch {
    return iso;
  }
}

export function formatAppointmentTime(startIso: string, endIso?: string): string {
  try {
    const start = new Date(startIso);
    const startTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (!endIso) return startTime;
    const end = new Date(endIso);
    const endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  } catch {
    return '';
  }
}

export function formatFullDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

export function calculateDurationMinutes(startIso: string, endIso?: string): number {
  if (!endIso) return 30;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
}

export interface GridDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: AppointmentDTO[];
}

export function generateMonthGrid(
  year: number,
  month: number,
  selectedDate: Date,
  appointments: AppointmentDTO[]
): GridDay[] {
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const days: GridDay[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      appointments: appointments.filter((app) => isSameDay(new Date(app.startDateTime), d)),
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day);
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      appointments: appointments.filter((app) => isSameDay(new Date(app.startDateTime), d)),
    });
  }

  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const d = new Date(year, month + 1, day);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate),
      appointments: appointments.filter((app) => isSameDay(new Date(app.startDateTime), d)),
    });
  }

  return days;
}
