'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { getClinicalAuditAction, updateMedicalRecordAction } from '@/actions/medicalRecords';
import { SessionNoteEditor, type AppointmentOption } from '@/components/Organism/SessionNoteEditor';
import { SessionNoteCard } from '@/components/Organism/SessionNoteCard';
import { AddendumModal } from '@/components/Molecules/AddendumModal';
import { RecordPdfExport } from '@/components/Molecules/RecordPdfExport';
import { formatDate, formatDateTime } from '@/lib/datetime';
import {
  AUDIT_ACTION_LABEL,
  type ClinicalAuditEntry,
  type MedicalRecord,
  type MedicalRecordFields,
  type SessionNote,
} from '@/types/medicalRecord';

interface Props {
  record: MedicalRecord;
  notes: SessionNote[];
  appointments: AppointmentOption[];
}

const FIELDS: { key: keyof MedicalRecordFields; label: string; hint: string }[] = [
  { key: 'demand', label: 'Avaliação de demanda', hint: 'Queixa e demanda que motivaram o atendimento.' },
  { key: 'goals', label: 'Objetivos do trabalho', hint: 'Objetivos definidos com o(a) paciente.' },
  { key: 'history', label: 'Histórico', hint: 'Histórico relevante (familiar, saúde, contexto).' },
  { key: 'procedures', label: 'Procedimentos técnico-científicos adotados', hint: 'Abordagem, técnicas, instrumentos.' },
  { key: 'closing', label: 'Encaminhamento / encerramento', hint: 'Encaminhamentos realizados ou encerramento.' },
];

type Tab = 'notes' | 'record' | 'audit';

export function MedicalRecordWorkspace({ record: initialRecord, notes: initialNotes, appointments }: Props) {
  const [record, setRecord] = useState(initialRecord);
  const [notes, setNotes] = useState(initialNotes);
  const [tab, setTab] = useState<Tab>('notes');
  const [editing, setEditing] = useState<SessionNote | 'new' | null>(null);
  const [addendumFor, setAddendumFor] = useState<SessionNote | null>(null);
  const [fields, setFields] = useState<MedicalRecordFields>({
    demand: record.demand, goals: record.goals, history: record.history, procedures: record.procedures, closing: record.closing,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<ClinicalAuditEntry[] | null>(null);
  const [auditError, setAuditError] = useState('');
  const [isPending, startTransition] = useTransition();

  function upsertNote(note: SessionNote) {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
    });
  }

  function saveRecord(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateMedicalRecordAction(record.treatmentLinkId, fields, record.version);
      if (result.error || !result.data) {
        setFieldErrors(result.fields ?? {});
        toast.error(result.error ?? 'Não foi possível salvar o prontuário.');
        return;
      }
      setRecord(result.data);
      setFieldErrors({});
      toast.success('Prontuário salvo.');
    });
  }

  function openAudit() {
    setTab('audit');
    if (audit) return;
    startTransition(async () => {
      const result = await getClinicalAuditAction(record.treatmentLinkId);
      if (result.error || !result.data) { setAuditError(result.error ?? 'Não foi possível carregar a auditoria.'); return; }
      setAudit(result.data.content);
    });
  }

  const tabs: { id: Tab; label: string; onClick: () => void }[] = [
    { id: 'notes', label: `Anotações de sessão (${notes.length})`, onClick: () => setTab('notes') },
    { id: 'record', label: 'Registro documental', onClick: () => setTab('record') },
    ...(record.opened ? [{ id: 'audit' as Tab, label: 'Auditoria de acessos', onClick: openAudit }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prontuário psicológico</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">{record.patientName}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-full border font-semibold ${record.linkActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {record.linkActive ? 'Vínculo ativo' : 'Vínculo encerrado — somente consulta e adendos'}
          </span>
          {record.openingDate && <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">Aberto em {formatDate(record.openingDate)}</span>}
          <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">🔒 Conteúdo cifrado · acessos auditados</span>
        </div>
        {record.opened && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1">
            <RecordPdfExport linkId={record.treatmentLinkId} />
            <p className="text-xs text-slate-500">
              O PDF traz o registro documental e as anotações finalizadas (rascunhos não entram), com autor, CRP, data e hash.
              Anotações pessoais só entram se marcadas e nunca fazem parte da cópia do paciente.
            </p>
          </div>
        )}
      </header>

      <div role="tablist" aria-label="Seções do prontuário" className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={t.onClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border ${tab === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div role="tabpanel" className="flex flex-col gap-4">
          {editing ? (
            <SessionNoteEditor
              key={editing === 'new' ? 'new' : editing.id}
              linkId={record.treatmentLinkId}
              appointments={appointments}
              draft={editing === 'new' ? null : editing}
              onSaved={upsertNote}
              onFinalized={(note) => { upsertNote(note); setEditing(null); }}
              onClose={() => setEditing(null)}
            />
          ) : record.canEdit ? (
            <button type="button" onClick={() => setEditing('new')}
              className="self-start inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl shadow-sm">
              + Nova anotação
            </button>
          ) : null}

          {notes.length === 0 && !editing && (
            <p className="py-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">Nenhuma anotação registrada ainda.</p>
          )}
          {notes.map((note) => (
            <SessionNoteCard key={note.id} note={note}
              onContinue={(n) => setEditing(n)}
              onAddendum={(n) => setAddendumFor(n)} />
          ))}
        </div>
      )}

      {tab === 'record' && (
        <form role="tabpanel" onSubmit={saveRecord} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5" noValidate>
          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">{f.label}</span>
              <span className="text-xs text-slate-500">{f.hint}</span>
              <textarea value={fields[f.key] ?? ''} maxLength={20000} rows={4} readOnly={!record.canEdit}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="mt-1 w-full px-4 py-3 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y read-only:bg-slate-100" />
              {fieldErrors[f.key] && <span role="alert" className="text-xs text-red-600">{fieldErrors[f.key]}</span>}
            </label>
          ))}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{record.updatedAt ? `Última atualização em ${formatDateTime(record.updatedAt)}` : 'Prontuário ainda não aberto.'}</p>
            {record.canEdit && (
              <button type="submit" disabled={isPending}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
                {isPending ? 'Salvando…' : 'Salvar registro'}
              </button>
            )}
          </div>
        </form>
      )}

      {tab === 'audit' && (
        <section role="tabpanel" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <p className="px-5 py-3 text-xs text-slate-500 border-b border-slate-100">
            Trilha imutável de acessos e alterações (os 20 eventos mais recentes). Nenhum conteúdo clínico é registrado aqui.
          </p>
          {auditError && <p role="alert" className="px-5 py-4 text-sm text-red-700">{auditError}</p>}
          {!audit && !auditError && <p className="px-5 py-8 text-sm text-slate-500" aria-busy="true">Carregando…</p>}
          {audit && (
            <table className="w-full text-sm">
              <caption className="sr-only">Auditoria de acessos ao prontuário</caption>
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase">
                  <th scope="col" className="px-5 py-2">Quando</th>
                  <th scope="col" className="px-5 py-2">Ação</th>
                  <th scope="col" className="px-5 py-2">Quem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {audit.map((e) => (
                  <tr key={e.sequence}>
                    <td className="px-5 py-2 text-slate-600 tabular-nums whitespace-nowrap">{formatDateTime(e.occurredAt)}</td>
                    <td className="px-5 py-2 text-slate-800">{AUDIT_ACTION_LABEL[e.action] ?? e.action}</td>
                    <td className="px-5 py-2 text-slate-600">{e.actorName}{e.actorRole === 'PATIENT' ? ' (paciente)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {addendumFor && (
        <AddendumModal note={addendumFor} onClose={() => setAddendumFor(null)} onAdded={upsertNote} />
      )}
    </div>
  );
}
