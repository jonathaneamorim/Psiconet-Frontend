import type { Metadata } from 'next';
import Link from 'next/link';
import { getMyMedicalRecordsAction, getPsychologistAccessRequestsAction } from '@/actions/medicalRecords';
import { AccessRequestsPanel } from '@/components/Organism/AccessRequestsPanel';
import { formatDateTime } from '@/lib/datetime';

export const metadata: Metadata = { title: 'Prontuários | Psiconet' };

interface Props {
  searchParams: Promise<{ aba?: string }>;
}

export default async function PsychologistRecordsPage({ searchParams }: Props) {
  const { aba } = await searchParams;
  const showRequests = aba === 'solicitacoes';
  const [records, requests] = await Promise.all([getMyMedicalRecordsAction(), getPsychologistAccessRequestsAction()]);
  const pendingCount = requests.data?.filter((r) => r.status === 'PENDING').length ?? 0;
  const error = records.error ?? requests.error;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Prontuários</h1>
          <p className="text-slate-600 mt-1">Um prontuário por paciente vinculado. Conteúdo cifrado e acessos auditados.</p>
        </div>

        <nav aria-label="Seções" className="flex gap-2">
          <Link href="/psychologist/medical-records" aria-current={!showRequests ? 'page' : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${!showRequests ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            Pacientes
          </Link>
          <Link href="/psychologist/medical-records?aba=solicitacoes" aria-current={showRequests ? 'page' : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${showRequests ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            Solicitações de acesso{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Link>
        </nav>

        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

        {showRequests && requests.data && <AccessRequestsPanel initial={requests.data} />}

        {!showRequests && records.data && (
          records.data.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
              Você ainda não tem pacientes vinculados. O prontuário fica disponível quando uma conexão é aceita.
            </p>
          ) : (
            <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {records.data.map((r) => (
                <li key={r.treatmentLinkId}>
                  <Link href={`/psychologist/medical-records/${r.treatmentLinkId}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]">
                    <div>
                      <p className="font-semibold text-slate-800">{r.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {r.recordOpened ? `${r.notesCount} anotação(ões) · atualizado em ${formatDateTime(r.updatedAt)}` : 'Prontuário ainda não aberto'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {r.pendingAccessRequests > 0 && (
                        <span className="px-2.5 py-1 rounded-full border text-xs font-semibold bg-amber-50 text-amber-800 border-amber-200">Solicitação pendente</span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${r.linkActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {r.linkActive ? 'Vínculo ativo' : 'Vínculo encerrado'}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
