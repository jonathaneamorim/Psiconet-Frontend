const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

/** Data e hora no padrão brasileiro; "—" para valores ausentes ou inválidos. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormatter.format(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d);
}

/**
 * Data pura "AAAA-MM-DD" (ex.: vigência de documento) → "DD/MM/AAAA", sem passar por Date:
 * `new Date("2026-10-02")` é meia-noite UTC e viraria o dia anterior no fuso do Brasil.
 */
export function formatPlainDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '—';
}
