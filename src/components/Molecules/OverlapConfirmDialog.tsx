'use client';

import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { OverlapSummary } from '@/types/appointment';
import { describeOverlap } from '@/lib/overlap';

interface Props {
  conflicts: OverlapSummary[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * "Horário já ocupado — deseja agendar mesmo assim?" (409 SCHEDULE_OVERLAP, ADR 019).
 * `role="alertdialog"`, foco inicial em "Voltar" (ação segura), Esc fecha, botões travados durante o reenvio.
 */
export function OverlapConfirmDialog({ conflicts, isSubmitting, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSubmitting) onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, isSubmitting]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle aria-hidden="true" className="w-5 h-5" />
          </div>
          <div>
            <h2 id={titleId} className="text-base font-bold text-slate-800">Horário já ocupado</h2>
            <p className="text-xs text-slate-500">Deseja agendar mesmo assim?</p>
          </div>
        </div>

        <div id={descriptionId} className="text-sm text-slate-700">
          <p className="mb-2">{conflicts.length === 1 ? 'Já existe uma consulta neste horário:' : 'Já existem consultas neste horário:'}</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            {conflicts.map((c) => <li key={c.id}>{describeOverlap(c, true)}</li>)}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            As duas consultas ficarão marcadas como sobrepostas na sua agenda até uma delas ser cancelada ou remarcada.
            O paciente não é informado sobre a outra consulta.
          </p>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            ref={backRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50 cursor-pointer"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Agendando...' : 'Agendar mesmo assim'}
          </button>
        </div>
      </div>
    </div>
  );
}
