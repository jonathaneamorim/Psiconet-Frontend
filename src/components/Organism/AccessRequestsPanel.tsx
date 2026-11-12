'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { denyAccessRequestAction, grantAccessRequestAction } from '@/actions/medicalRecords';
import { ModalShell } from '@/components/Molecules/ModalShell';
import { formatDateTime } from '@/lib/datetime';
import type { AccessRequest } from '@/types/medicalRecord';

const STATUS_LABEL = { PENDING: 'Aguardando decisão', GRANTED: 'Liberado', DENIED: 'Negado' } as const;

/** Solicitações de pacientes para acessar o próprio prontuário (liberar ou negar com justificativa). */
export function AccessRequestsPanel({ initial }: { initial: AccessRequest[] }) {
  const [requests, setRequests] = useState(initial);
  const [granting, setGranting] = useState<AccessRequest | null>(null);
  const [denying, setDenying] = useState<AccessRequest | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [exportAllowed, setExportAllowed] = useState(true);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const replace = (r: AccessRequest) => setRequests((prev) => prev.map((x) => (x.id === r.id ? r : x)));

  function grant() {
    if (!granting) return;
    startTransition(async () => {
      const result = await grantAccessRequestAction(granting.id, {
        expiresAt: expiresAt ? `${expiresAt}T23:59:59` : null,
        exportAllowed,
      });
      if (result.error || !result.data) { setError(result.fields?.expiresAt ?? result.error ?? 'Erro ao liberar.'); return; }
      replace(result.data);
      toast.success('Acesso liberado. O paciente foi notificado.');
      setGranting(null);
    });
  }

  function deny() {
    if (!denying) return;
    if (justification.trim().length < 10) { setError('A justificativa deve ter ao menos 10 caracteres.'); return; }
    startTransition(async () => {
      const result = await denyAccessRequestAction(denying.id, justification.trim());
      if (result.error || !result.data) { setError(result.fields?.justification ?? result.error ?? 'Erro ao negar.'); return; }
      replace(result.data);
      toast.success('Decisão registrada. O paciente foi notificado.');
      setDenying(null);
    });
  }

  const pending = requests.filter((r) => r.status === 'PENDING');
  const decided = requests.filter((r) => r.status !== 'PENDING');
  const today = new Date().toISOString().slice(0, 10);

  const renderRow = (r: AccessRequest) => (
    <li key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
      <div>
        <p className="font-semibold text-slate-800">{r.patientName}</p>
        <p className="text-xs text-slate-500">
          Solicitado em {formatDateTime(r.requestedAt)}
          {r.decidedAt && ` · ${STATUS_LABEL[r.status].toLowerCase()} em ${formatDateTime(r.decidedAt)}`}
          {r.status === 'GRANTED' && (r.expiresAt ? ` · válido até ${formatDateTime(r.expiresAt)}` : ' · sem prazo')}
          {r.status === 'GRANTED' && (r.exportAllowed ? ' · PDF permitido' : ' · sem PDF')}
        </p>
        {r.justification && <p className="text-xs text-slate-600 mt-1"><span className="font-medium">Justificativa:</span> {r.justification}</p>}
      </div>
      {r.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => { setError(''); setJustification(''); setDenying(r); }}
            className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">Negar</button>
          <button type="button" onClick={() => { setError(''); setExpiresAt(''); setExportAllowed(true); setGranting(r); }}
            className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Liberar</button>
        </div>
      ) : (
        <span className={`self-start px-2.5 py-1 rounded-full border text-xs font-semibold ${r.status === 'GRANTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {STATUS_LABEL[r.status]}
        </span>
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="px-5 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700">Aguardando sua decisão ({pending.length})</h2>
        {pending.length === 0
          ? <p className="px-5 py-8 text-center text-sm text-slate-500">Nenhuma solicitação pendente.</p>
          : <ul className="divide-y divide-slate-100">{pending.map(renderRow)}</ul>}
      </section>
      {decided.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="px-5 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700">Histórico</h2>
          <ul className="divide-y divide-slate-100">{decided.map(renderRow)}</ul>
        </section>
      )}

      {granting && (
        <ModalShell title="Liberar acesso ao prontuário" subtitle={granting.patientName} onClose={() => setGranting(null)}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              O paciente verá, <strong>somente para leitura</strong>, o registro documental (campos do prontuário e
              registros de evolução finalizados). Anotações pessoais e rascunhos não são exibidos.
            </p>
            <label>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Válido até (opcional)</span>
              <input type="date" min={today} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={exportAllowed} onChange={(e) => setExportAllowed(e.target.checked)} className="w-4 h-4" />
              Permitir exportação em PDF
            </label>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setGranting(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl">Cancelar</button>
              <button type="button" onClick={grant} disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-60">
                {isPending ? 'Liberando…' : 'Liberar acesso'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {denying && (
        <ModalShell title="Negar acesso" subtitle={denying.patientName} onClose={() => setDenying(null)}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <label>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Justificativa (obrigatória)</span>
              <textarea value={justification} rows={5} maxLength={2000} onChange={(e) => setJustification(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-y" />
              <span className="text-xs text-slate-500">Fica registrada e é exibida ao paciente apenas dentro da plataforma (nunca por e-mail).</span>
            </label>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setDenying(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl">Cancelar</button>
              <button type="button" onClick={deny} disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-60">
                {isPending ? 'Registrando…' : 'Negar com justificativa'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
