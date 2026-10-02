import type { Metadata } from 'next';
import { getMyRecordLinksAction } from '@/actions/medicalRecords';
import { PatientRecordLinks } from '@/components/Organism/PatientRecordLinks';

export const metadata: Metadata = { title: 'Meu prontuário | Psiconet' };

export default async function PatientRecordsPage() {
  const { data, error } = await getMyRecordLinksAction();

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meu prontuário</h1>
          <p className="text-slate-600 mt-1">
            Você pode solicitar ao seu psicólogo o acesso ao registro documental do seu acompanhamento.
            O acesso é somente leitura e toda consulta fica registrada.
          </p>
        </div>
        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
        {data && <PatientRecordLinks initial={data} />}
      </div>
    </div>
  );
}
