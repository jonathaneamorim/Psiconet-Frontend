'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RichTextEditor } from '@/components/Molecules/RichTextEditor';
import { ConfirmModal } from '@/components/Molecules/ConfirmModal';
import {
  createSessionNoteAction,
  finalizeSessionNoteAction,
  saveSessionNoteDraftAction,
} from '@/actions/medicalRecords';
import {
  EMPTY_DOC,
  NOTE_TYPE_HINT,
  NOTE_TYPE_LABEL,
  type RichTextDoc,
  type RichTextNode,
  type SessionNote,
  type SessionNoteType,
} from '@/types/medicalRecord';

const AUTOSAVE_DELAY_MS = 1500;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export interface AppointmentOption {
  id: string;
  label: string;
}

interface Props {
  linkId: string;
  appointments: AppointmentOption[];
  /** Rascunho existente para continuar editando */
  draft?: SessionNote | null;
  onSaved: (note: SessionNote) => void;
  onFinalized: (note: SessionNote) => void;
  onClose: () => void;
}

function hasText(node: RichTextNode | null | undefined): boolean {
  if (!node) return false;
  if (node.type === 'text' && node.text?.trim()) return true;
  return (node.content ?? []).some(hasText);
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * Editor de anotação de sessão. Autosave do rascunho no SERVIDOR (cifrado), com debounce —
 * nada clínico vai para localStorage/sessionStorage. Ao finalizar, o registro fica imutável.
 */
export function SessionNoteEditor({ linkId, appointments, draft, onSaved, onFinalized, onClose }: Props) {
  const [noteId, setNoteId] = useState<string | null>(draft?.id ?? null);
  const [version, setVersion] = useState<number | null>(draft?.version ?? null);
  const [type, setType] = useState<SessionNoteType>(draft?.type ?? 'RECORD');
  const [title, setTitle] = useState(draft?.title ?? '');
  const [appointmentId, setAppointmentId] = useState<string>(draft?.appointmentId ?? '');
  const [doc, setDoc] = useState<RichTextDoc>(draft?.content ?? EMPTY_DOC);
  const [saveState, setSaveState] = useState<SaveState>(draft ? 'saved' : 'idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(draft?.updatedAt ? new Date(draft.updatedAt) : null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<SessionNote | null> | null>(null);
  const latest = useRef({ noteId, version, type, title, appointmentId, doc });
  latest.current = { noteId, version, type, title, appointmentId, doc };
  const dirty = saveState === 'dirty' || saveState === 'error';

  const save = useCallback(async (): Promise<SessionNote | null> => {
    if (inFlight.current) await inFlight.current;
    const current = latest.current;
    if (!current.noteId && !hasText(current.doc)) return null;

    setSaveState('saving');
    const run = (async () => {
      const result = current.noteId
        ? await saveSessionNoteDraftAction(current.noteId, {
            type: current.type, title: current.title, content: current.doc, version: current.version,
          })
        : await createSessionNoteAction(linkId, {
            appointmentId: current.appointmentId || null, type: current.type, title: current.title, content: current.doc,
          });

      if (result.error || !result.data) {
        setSaveState(result.code === 'CONFLICT' ? 'conflict' : 'error');
        if (result.code !== 'CONFLICT') toast.error(result.error ?? 'Não foi possível salvar o rascunho.');
        return null;
      }
      setNoteId(result.data.id);
      setVersion(result.data.version);
      setLastSavedAt(new Date());
      // Se o usuário continuou digitando durante o salvamento, outro autosave será agendado
      setSaveState((prev) => (prev === 'saving' ? 'saved' : prev));
      onSaved(result.data);
      return result.data;
    })();
    inFlight.current = run;
    try {
      return await run;
    } finally {
      inFlight.current = null;
    }
  }, [linkId, onSaved]);

  const scheduleSave = useCallback(() => {
    setSaveState('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void save(); }, AUTOSAVE_DELAY_MS);
  }, [save]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  async function handleFinalize() {
    setConfirmFinalize(false);
    setFinalizing(true);
    if (timer.current) clearTimeout(timer.current);
    const saved = (await save()) ?? (latest.current.noteId ? { id: latest.current.noteId } : null);
    if (!saved) {
      setFinalizing(false);
      toast.error('Escreva a anotação antes de finalizar.');
      return;
    }
    const result = await finalizeSessionNoteAction(saved.id);
    setFinalizing(false);
    if (result.error || !result.data) {
      toast.error(result.error ?? 'Não foi possível finalizar.');
      return;
    }
    toast.success('Anotação finalizada e protegida com hash de integridade.');
    onFinalized(result.data);
  }

  const statusText: Record<SaveState, string> = {
    idle: 'O rascunho é salvo automaticamente enquanto você escreve.',
    dirty: 'Alterações pendentes…',
    saving: 'Salvando rascunho…',
    saved: lastSavedAt ? `Rascunho salvo às ${timeFormatter.format(lastSavedAt)}` : 'Rascunho salvo',
    error: 'Falha ao salvar. Tentaremos de novo na próxima alteração.',
    conflict: 'Este rascunho foi alterado em outra aba. Recarregue a página para continuar.',
  };

  return (
    <section aria-label="Editor de anotação" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <label className="flex-1">
          <span className="block text-xs font-semibold text-slate-600 mb-1">Título (opcional)</span>
          <input value={title} maxLength={150} onChange={(e) => { setTitle(e.target.value); scheduleSave(); }}
            placeholder="Ex.: Sessão 5 — evolução"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
        </label>
        <label className="lg:w-64">
          <span className="block text-xs font-semibold text-slate-600 mb-1">Consulta</span>
          <select value={appointmentId} disabled={Boolean(noteId)}
            onChange={(e) => setAppointmentId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white disabled:bg-slate-50">
            <option value="">Sem consulta vinculada</option>
            {appointments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
        <label className="lg:w-56">
          <span className="block text-xs font-semibold text-slate-600 mb-1">Tipo</span>
          <select value={type} onChange={(e) => { setType(e.target.value as SessionNoteType); scheduleSave(); }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white" aria-describedby="note-type-hint">
            {(Object.keys(NOTE_TYPE_LABEL) as SessionNoteType[]).map((t) => <option key={t} value={t}>{NOTE_TYPE_LABEL[t]}</option>)}
          </select>
        </label>
      </div>
      <p id="note-type-hint" className="text-xs text-slate-500 -mt-2">{NOTE_TYPE_HINT[type]}</p>

      <RichTextEditor
        value={doc}
        ariaLabel="Conteúdo da anotação"
        onChange={(next) => { setDoc(next); scheduleSave(); }}
        onBlur={() => { if (saveState === 'dirty') { if (timer.current) clearTimeout(timer.current); void save(); } }}
        minHeightClass="min-h-72"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p role="status" aria-live="polite"
          className={`text-xs ${saveState === 'error' || saveState === 'conflict' ? 'text-red-600' : 'text-slate-500'}`}>
          {statusText[saveState]}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={async () => { if (dirty) await save(); onClose(); }}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
            Fechar
          </button>
          <button type="button" onClick={() => setConfirmFinalize(true)} disabled={finalizing || saveState === 'conflict'}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
            {finalizing ? 'Finalizando…' : 'Finalizar anotação'}
          </button>
        </div>
      </div>

      {confirmFinalize && (
        <ConfirmModal
          title="Finalizar anotação?"
          description="Depois de finalizada, a anotação recebe data/hora do servidor, sua identificação (nome e CRP) e um hash de integridade, e não pode mais ser alterada. Correções serão feitas por adendo."
          confirmLabel="Finalizar"
          confirmVariant="primary"
          onConfirm={handleFinalize}
          onClose={() => setConfirmFinalize(false)}
        />
      )}
    </section>
  );
}
