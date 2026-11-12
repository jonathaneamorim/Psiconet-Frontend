import { AlertTriangle } from 'lucide-react';
import type { OverlapSummary } from '@/types/appointment';
import { overlapTooltip } from '@/lib/overlap';

interface Props {
  overlaps?: OverlapSummary[];
  /** Compacto: só ícone + texto curto (células do calendário). */
  compact?: boolean;
}

/**
 * Selo "Sobreposição" (ADR 019 do backend). Só aparece na visão do psicólogo — os dados vêm do backend
 * apenas para ele. Ícone + texto (cor nunca é o único sinal) e descrição completa para leitor de tela.
 */
export function OverlapBadge({ overlaps, compact = false }: Props) {
  const description = overlapTooltip(overlaps);
  return (
    <span
      title={description}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 font-semibold ${compact ? 'px-1 py-0 text-[9px]' : 'px-2 py-0.5 text-[11px]'}`}
    >
      <AlertTriangle aria-hidden="true" className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {compact ? <span aria-hidden="true">!</span> : 'Sobreposição'}
      <span className="sr-only">{description}</span>
    </span>
  );
}
