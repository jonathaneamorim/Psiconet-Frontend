import type { RecurrenceFrequency, DayOfWeek } from '@/types/recurrence';

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  FIRST_DAY_OF_MONTH: 'Primeiro dia do mês',
  LAST_DAY_OF_MONTH: 'Último dia do mês',
  EVERY_N_DAYS: 'A cada X dias',
};

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

// Frequências que dependem de um dia da semana específico (o back valida que
// a data de início caia exatamente nesse dia).
export const FREQUENCIES_WITH_WEEKDAY: RecurrenceFrequency[] = ['WEEKLY', 'BIWEEKLY'];

// Frequências em que o ajuste de fim de semana faz sentido (o back rejeita o
// campo `true` para qualquer outra frequência). EVERY_N_DAYS fica de fora de propósito:
// o intervalo em dias pode cair em qualquer dia da semana, sem ajuste.
export const FREQUENCIES_WITH_WEEKEND_ADJUSTMENT: RecurrenceFrequency[] = [
  'FIRST_DAY_OF_MONTH',
  'LAST_DAY_OF_MONTH',
];

// Frequências que repetem no mesmo dia do mês da data de início (mês/bimestre/trimestre).
export const FREQUENCIES_WITH_MONTH_DAY_LOCK: RecurrenceFrequency[] = ['MONTHLY', 'BIMONTHLY', 'QUARTERLY'];

export const MONTH_STEP_BY_FREQUENCY: Partial<Record<RecurrenceFrequency, number>> = {
  MONTHLY: 1,
  BIMONTHLY: 2,
  QUARTERLY: 3,
};

const JS_DAY_BY_DAY_OF_WEEK: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export function jsDayToDayOfWeek(jsDay: number): DayOfWeek {
  return JS_DAY_BY_DAY_OF_WEEK[jsDay];
}

export function dayOfWeekToJsDay(dayOfWeek: DayOfWeek): number {
  return JS_DAY_BY_DAY_OF_WEEK.indexOf(dayOfWeek);
}

function toDateInputValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Primeira data (hoje ou depois) que cai no dia da semana informado. */
export function nextDateForDayOfWeek(from: Date, dayOfWeek: DayOfWeek): string {
  const targetJsDay = dayOfWeekToJsDay(dayOfWeek);
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diff = (targetJsDay - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return toDateInputValue(date);
}

/** Primeiro dia (hoje ou depois) do próximo mês aplicável, para FIRST_DAY_OF_MONTH. */
export function nextFirstDayOfMonth(from: Date): string {
  const isFirstDay = from.getDate() === 1;
  const target = isFirstDay ? from : new Date(from.getFullYear(), from.getMonth() + 1, 1);
  return toDateInputValue(new Date(target.getFullYear(), target.getMonth(), 1));
}

/** Último dia do mês corrente (sempre hoje ou uma data futura), para LAST_DAY_OF_MONTH. */
export function nextLastDayOfMonth(from: Date): string {
  return toDateInputValue(new Date(from.getFullYear(), from.getMonth() + 1, 0));
}

export function dateStringMatchesDayOfWeek(dateStr: string, dayOfWeek: DayOfWeek): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === dayOfWeekToJsDay(dayOfWeek);
}

export function dateStringIsFirstDayOfMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const day = Number(dateStr.split('-')[2]);
  return day === 1;
}

export function dateStringIsLastDayOfMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return day === lastDay;
}
