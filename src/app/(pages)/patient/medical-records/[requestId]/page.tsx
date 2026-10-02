import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGrantedRecordAction } from '@/actions/medicalRecords';
import { SessionNoteCard } from '@/components/Organism/SessionNoteCard';
import { formatDate, formatDateTime } from '@/lib/datetime';

export const metadata: Metadata = { title: 'Prontuário | Psiconet' };

interface Props {
  params: Promise<{ requestId: string }>;
}

const SECTIONS = [
  { key: 'demand', label: 'Avaliação de demanda' },
  { key: 'goals', label: 'Objetivos do trabalho' },
  { key: 'history', label: 'Histórico' },
  { key: 'procedures', label: 'Procedimentos adotados' },
  { key: 'closing', label: 'Encaminhamento / encerramento' },
] as const;

export default async function PatientRecordViewPage({ params }: Props) {
  const { requestId } = await params;
  const { data, error, status } = await getGrantedRecordAction(requestId);
  if (status === 404 || status === 400) notFound();

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Link href="/patient/medical-records" className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start">← Meu prontuário</Link>
        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
        {data && (
          <>
            <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prontuário — somente leitura</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-800">{data.patientName}</h1>
                <p className="text-sm text-slate-600">
                  Psicólogo(a): {data.psychologistName}{data.psychologistCrp ? ` — CRP ${data.psychologistCrp}` : ''}
                  {data.openingDate && ` · aberto em ${formatDate(data.openingDate)}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {data.accessExpiresAt ? `Acesso válido até ${formatDateTime(data.accessExpiresAt)}.` : 'Acesso sem prazo definido.'}
                  {' '}Anotações pessoais de trabalho do profissional não fazem parte desta visualização.
                </p>
              </div>
              {data.exportAllowed && (
                <a href={`/api/medical-records/${data.accessRequestId}/pdf`}
                  className="self-start px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">
                  Baixar PDF
                </a>
              )}
            </header>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
              {SECTIONS.map((s) => (
                <div key={s.key}>
                  <h2 className="text-sm font-semibold text-slate-700">{s.label}</h2>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{data[s.key] || '—'}</p>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Registros de evolução</h2>
              {data.notes.length === 0
                ? <p className="text-sm text-slate-500">Nenhum registro finalizado.</p>
                : data.notes.map((note) => <SessionNoteCard key={note.id} note={note} />)}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
