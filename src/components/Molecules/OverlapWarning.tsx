import { AlertTriangle } from 'lucide-react';
import type { OverlapSummary, RecurrenceOccurrenceOverlap } from '@/types/appointment';
import { describeOverlap } from '@/lib/overlap';

interface Props {
  /** Consulta única: consultas que ocupam o horário escolhido. */
  overlaps?: OverlapSummary[];
  /** Série: ocorrências que coincidem com outras consultas. */
  occurrences?: RecurrenceOccurrenceOverlap[];
}

const MAX_LISTED = 4;

/**
 * Aviso em tempo real no formulário (ADR 019): informa, não bloqueia — o psicólogo pode seguir e
 * confirmará ao salvar. `role="status"` para leitores de tela anunciarem sem roubar o foco.
 */
export function OverlapWarning({ overlaps = [], occurrences = [] }: Props) {
  if (overlaps.length === 0 && occurrences.length === 0) return null;

  return (
    <div role="status" aria-live="polite" className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
      <AlertTriangle aria-hidden="true" className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        {overlaps.length > 0 && (
          <>
            <p className="font-semibold">Você já tem consulta neste horário:</p>
            <ul className="list-disc pl-4">
              {overlaps.slice(0, MAX_LISTED).map((o) => <li key={o.id}>{describeOverlap(o)}</li>)}
            </ul>
          </>
        )}
        {occurrences.length > 0 && (
          <>
            <p className="font-semibold">
              {occurrences.length === 1
                ? '1 data da série coincide com outra consulta:'
                : `${occurrences.length} datas da série coincidem com outras consultas:`}
            </p>
            <ul className="list-disc pl-4">
              {occurrences.slice(0, MAX_LISTED).map((occ) => (
                <li key={occ.startDateTime}>
                  {occ.overlappingAppointments.map((o) => describeOverlap(o, true)).join('; ')}
                </li>
              ))}
            </ul>
            {occurrences.length > MAX_LISTED && <p>e mais {occurrences.length - MAX_LISTED}.</p>}
          </>
        )}
        <p>Você pode agendar mesmo assim; vamos pedir confirmação ao salvar.</p>
      </div>
    </div>
  );
}
