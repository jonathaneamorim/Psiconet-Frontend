import type { OverlapSummary } from '@/types/appointment';

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function day(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** "Ana Souza das 10:00 às 10:50" (com a data quando `withDate`). Só para a visão do psicólogo. */
export function describeOverlap(overlap: OverlapSummary, withDate = false): string {
  const when = `das ${time(overlap.startDateTime)} às ${time(overlap.endDateTime)}`;
  return `${overlap.patientName} ${withDate ? `em ${day(overlap.startDateTime)} ` : ''}${when}`;
}

/** Texto para leitor de tela e tooltip do selo de sobreposição. */
export function overlapTooltip(overlaps: OverlapSummary[] | undefined): string {
  if (!overlaps || overlaps.length === 0) return 'Horário com mais de uma consulta.';
  return `Mesmo horário de: ${overlaps.map((o) => describeOverlap(o)).join('; ')}.`;
}
