import { getMyAppointmentsAction } from '@/actions/appointments';
import { PsychologistAgendaView } from '@/components/Organism/PsychologistAgendaView';

export const metadata = {
  title: 'Agenda de Consultas | Psiconet',
  description: 'Gerencie sua agenda de atendimentos, consultas marcadas e confirmações de pacientes.',
};

export default async function PsychologistAppointmentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const preselectedPatientId = typeof searchParams.patientId === 'string' ? searchParams.patientId : undefined;

  const { data } = await getMyAppointmentsAction(0, 200, 'startDateTime,asc');

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <PsychologistAgendaView
          initialData={data}
          preselectedPatientId={preselectedPatientId}
        />
      </div>
    </div>
  );
}
