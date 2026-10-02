'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { requestRecordAccessAction } from '@/actions/medicalRecords';
import { ConfirmModal } from '@/components/Molecules/ConfirmModal';
import { formatDateTime } from '@/lib/datetime';
import type { PatientRecordLink } from '@/types/medicalRecord';

/** Vínculos do paciente com psicólogos e a situação do acesso ao prontuário de cada um. */
export function PatientRecordLinks({ initial }: { initial: PatientRecordLink[] }) {
  const [links, setLinks] = useState(initial);
  const [confirming, setConfirming] = useState<PatientRecordLink | null>(null);
  const [isPending, startTransition] = useTransition();

  function request() {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    startTransition(async () => {
      const result = await requestRecordAccessAction(target.treatmentLinkId);
      if (result.error || !result.data) { toast.error(result.error ?? 'Não foi possível enviar a solicitação.'); return; }
      setLinks((prev) => prev.map((l) => (l.treatmentLinkId === target.treatmentLinkId ? { ...l, latestRequest: result.data! } : l)));
      toast.success('Solicitação enviada. Você será avisado quando houver resposta.');
    });
  }

  if (links.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
        Você ainda não tem acompanhamento com psicólogos na plataforma.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {links.map((link) => {
          const req = link.latestRequest;
          const canRequest = !req || req.status === 'DENIED' || (req.status === 'GRANTED' && !req.activeGrant);
          return (
            <li key={link.treatmentLinkId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{link.psychologistName}</p>
                  <p className="text-xs text-slate-500">
                    {link.psychologistCrp ? `CRP ${link.psychologistCrp} · ` : ''}
                    {link.linkActive ? 'Acompanhamento ativo' : 'Acompanhamento encerrado'}
                  </p>
                </div>
                {req && (
                  <span className={`self-start px-2.5 py-1 rounded-full border text-xs font-semibold ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : req.activeGrant ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {req.status === 'PENDING' ? 'Aguardando resposta' : req.activeGrant ? 'Acesso liberado' : req.status === 'DENIED' ? 'Solicitação negada' : 'Acesso expirado'}
                  </span>
                )}
              </div>

              {req?.status === 'PENDING' && (
                <p className="text-sm text-slate-600">Solicitado em {formatDateTime(req.requestedAt)}. O(a) psicólogo(a) foi notificado(a).</p>
              )}
              {req?.status === 'DENIED' && req.justification && (
                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Justificativa do(a) psicólogo(a) — {formatDateTime(req.decidedAt)}</p>
                  <p className="whitespace-pre-line">{req.justification}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {req?.activeGrant && (
                  <Link href={`/patient/medical-records/${req.id}`}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">
                    Ver prontuário{req.expiresAt ? ` (até ${formatDateTime(req.expiresAt)})` : ''}
                  </Link>
                )}
                {canRequest && (
                  <button type="button" onClick={() => setConfirming(link)} disabled={isPending}
                    className="px-4 py-2 text-sm font-semibold text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-xl disabled:opacity-60">
                    {req ? 'Solicitar novamente' : 'Solicitar acesso ao prontuário'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {confirming && (
        <ConfirmModal
          title="Solicitar acesso ao prontuário?"
          description={`${confirming.psychologistName} receberá sua solicitação e decidirá se libera o acesso (somente leitura) ou se responde com uma justificativa.`}
          confirmLabel="Enviar solicitação"
          confirmVariant="primary"
          onConfirm={request}
          onClose={() => setConfirming(null)}
        />
      )}
    </>
  );
}
