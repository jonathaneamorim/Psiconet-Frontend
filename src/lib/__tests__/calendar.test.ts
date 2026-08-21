import {
  isSameDay,
  formatMonthYear,
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
  generateMonthGrid,
} from '../calendar';

describe('Calendar Utilities', () => {
  it('isSameDay correctly identifies matching dates', () => {
    const d1 = new Date(2026, 7, 20, 10, 0);
    const d2 = new Date(2026, 7, 20, 18, 30);
    const d3 = new Date(2026, 7, 21, 10, 0);

    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);
  });

  it('formatMonthYear formats month and year in Portuguese', () => {
    const date = new Date(2026, 7, 1); // August 2026
    expect(formatMonthYear(date)).toBe('Agosto de 2026');
  });

  it('formatAppointmentDate formats complete readable date', () => {
    const iso = '2026-08-25T14:00:00';
    const formatted = formatAppointmentDate(iso);
    expect(formatted).toContain('25 de Agosto');
  });

  it('formatAppointmentTime formats start and end time', () => {
    const start = '2026-08-25T14:00:00';
    const end = '2026-08-25T14:50:00';
    const formatted = formatAppointmentTime(start, end);
    expect(formatted).toContain('14:00');
    expect(formatted).toContain('14:50');
  });

  it('calculateDurationMinutes calculates correct duration', () => {
    const start = '2026-08-25T14:00:00';
    const end = '2026-08-25T14:50:00';
    expect(calculateDurationMinutes(start, end)).toBe(50);
  });

  it('generateMonthGrid generates a valid grid divisible by 7', () => {
    const grid = generateMonthGrid(2026, 7, new Date(2026, 7, 20), []);
    expect(grid.length % 7).toBe(0);
    expect(grid.length).toBeGreaterThanOrEqual(28);

    const currentMonthDays = grid.filter((d) => d.isCurrentMonth);
    expect(currentMonthDays.length).toBe(31); // August has 31 days
  });
});
