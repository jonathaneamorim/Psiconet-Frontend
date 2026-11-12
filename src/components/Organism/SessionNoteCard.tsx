'use client';

import { RichTextViewer } from '@/components/Atoms/RichTextViewer';
import { formatDateTime, formatDate } from '@/lib/datetime';
import { NOTE_TYPE_LABEL, type SessionNote } from '@/types/medicalRecord';

interface Props {
  note: SessionNote;
  onContinue?: (note: SessionNote) => void;
  onAddendum?: (note: SessionNote) => void;
}

function IntegrityBadge({ verified, hash }: { verified: boolean; hash: string | null }) {
  if (!hash) return null;
  return (
    <span title={`SHA-256: ${hash}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${verified ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
      {verified ? '✓ Íntegro' : '✕ Integridade divergente'}
      <span className="font-mono font-normal">{hash.slice(0, 10)}…</span>
    </span>
  );
}

/** Exibição de uma anotação (rascunho ou finalizada) com adendos e verificação de integridade. */
export function SessionNoteCard({ note, onContinue, onAddendum }: Props) {
  const finalized = note.status === 'FINALIZED';
  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${note.type === 'RECORD' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-violet-50 text-violet-800 border-violet-200'}`}>
              {NOTE_TYPE_LABEL[note.type]}
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${finalized ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
              {finalized ? 'Finalizada' : 'Rascunho'}
            </span>
            {finalized && <IntegrityBadge verified={note.integrityVerified} hash={note.integrityHash} />}
          </div>
          <h3 className="mt-2 font-semibold text-slate-800 break-words">
            {note.title || (note.appointmentStart ? `Sessão de ${formatDate(note.appointmentStart)}` : 'Anotação')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {finalized
              ? `Finalizada em ${formatDateTime(note.finalizedAt)} por ${note.authorName}${note.authorCrp ? ` (CRP ${note.authorCrp})` : ''}`
              : `Última alteração em ${formatDateTime(note.updatedAt ?? note.createdAt)}`}
            {note.appointmentStart && ` · consulta de ${formatDateTime(note.appointmentStart)}`}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!finalized && note.editable && onContinue && (
            <button type="button" onClick={() => onContinue(note)}
              className="px-3 py-1.5 text-xs font-semibold text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-lg">
              Continuar editando
            </button>
          )}
          {finalized && onAddendum && (
            <button type="button" onClick={() => onAddendum(note)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
              Adendo / retificação
            </button>
          )}
        </div>
      </header>

      <div className="mt-3">
        <RichTextViewer doc={note.content} />
      </div>

      {note.addenda.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3 border-l-2 border-amber-200 pl-4" aria-label="Adendos">
          {note.addenda.map((a) => (
            <li key={a.id}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-amber-800">Adendo nº {a.sequence}</span>
                <span className="text-slate-500">{formatDateTime(a.createdAt)} · {a.authorName}{a.authorCrp ? ` (CRP ${a.authorCrp})` : ''}</span>
                <IntegrityBadge verified={a.integrityVerified} hash={a.integrityHash} />
              </div>
              <p className="text-xs text-slate-600 mt-1"><span className="font-medium">Motivo:</span> {a.reason}</p>
              <RichTextViewer doc={a.content} className="mt-1 text-sm" />
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
