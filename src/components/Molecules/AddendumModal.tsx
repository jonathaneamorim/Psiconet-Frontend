'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModalShell } from '@/components/Molecules/ModalShell';
import { RichTextEditor } from '@/components/Molecules/RichTextEditor';
import { addSessionNoteAddendumAction } from '@/actions/medicalRecords';
import { EMPTY_DOC, type RichTextDoc, type SessionNote } from '@/types/medicalRecord';

interface Props {
  note: SessionNote;
  onClose: () => void;
  onAdded: (note: SessionNote) => void;
}

/** Adendo/retificação de anotação finalizada: datado, assinado e encadeado ao hash anterior. */
export function AddendumModal({ note, onClose, onAdded }: Props) {
  const [reason, setReason] = useState('');
  const [doc, setDoc] = useState<RichTextDoc>(EMPTY_DOC);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (reason.trim().length < 3) { setError('Informe o motivo da retificação.'); return; }
    setSaving(true);
    const result = await addSessionNoteAddendumAction(note.id, { reason: reason.trim(), content: doc });
    setSaving(false);
    if (result.error || !result.data) {
      setError(result.fields?.content ?? result.fields?.reason ?? result.error ?? 'Erro ao registrar adendo.');
      return;
    }
    toast.success('Adendo registrado. O registro original foi preservado.');
    onAdded(result.data);
    onClose();
  }

  return (
    <ModalShell title="Adendo / retificação" subtitle="O registro original não será alterado" onClose={onClose} widthClass="max-w-2xl">
      <div className="px-6 py-5 flex flex-col gap-4">
        <label>
          <span className="block text-sm font-medium text-slate-700 mb-1.5">Motivo</span>
          <input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: correção de informação, complemento"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
        </label>
        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1.5">Conteúdo do adendo</span>
          <RichTextEditor value={doc} onChange={setDoc} ariaLabel="Conteúdo do adendo" minHeightClass="min-h-40" />
        </div>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancelar</button>
          <button type="button" onClick={submit} disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
            {saving ? 'Registrando…' : 'Registrar adendo'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
