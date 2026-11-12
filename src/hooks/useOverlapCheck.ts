'use client';

import { useEffect, useState } from 'react';
import { checkAppointmentOverlapsAction } from '@/actions/appointments';
import { draftRecurrenceOverlapsAction } from '@/actions/recurrenceRules';
import type { OverlapSummary, RecurrenceOccurrenceOverlap } from '@/types/appointment';
import type { RecurrenceRuleCreateDTO } from '@/types/recurrence';

export const OVERLAP_CHECK_DEBOUNCE_MS = 400;

type Request =
  | { kind: 'single'; startDateTime: string; endDateTime: string }
  | { kind: 'recurring'; treatmentLinkId: string; draft: RecurrenceRuleCreateDTO }
  | null;

/**
 * Pré-checagem de sobreposição enquanto o psicólogo preenche o formulário (ADR 019): espera
 * OVERLAP_CHECK_DEBOUNCE_MS sem mudanças e consulta o backend. Respostas atrasadas de uma versão anterior
 * do formulário são descartadas. Falha de rede não mostra aviso — a confirmação ao salvar continua valendo.
 */
export function useOverlapCheck(request: Request) {
  const [overlaps, setOverlaps] = useState<OverlapSummary[]>([]);
  const [occurrences, setOccurrences] = useState<RecurrenceOccurrenceOverlap[]>([]);
  const key = request ? JSON.stringify(request) : '';

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!request) {
        if (!cancelled) {
          setOverlaps([]);
          setOccurrences([]);
        }
        return;
      }
      if (request.kind === 'single') {
        const res = await checkAppointmentOverlapsAction(request.startDateTime, request.endDateTime);
        if (!cancelled) {
          setOverlaps(res.data ?? []);
          setOccurrences([]);
        }
      } else {
        const res = await draftRecurrenceOverlapsAction(request.treatmentLinkId, request.draft);
        if (!cancelled) {
          setOccurrences(res.data ?? []);
          setOverlaps([]);
        }
      }
    }, request ? OVERLAP_CHECK_DEBOUNCE_MS : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // A chave serializada representa o pedido; o objeto muda de identidade a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { overlaps, occurrences };
}
