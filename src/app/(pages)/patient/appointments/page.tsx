import { getMyAppointmentsAction } from '@/actions/appointments';
import { PatientAgendaView } from '@/components/Organism/PatientAgendaView';

export const metadata = {
  title: 'Minhas Consultas | Psiconet',
  description: 'Acompanhe sua agenda de sessões de terapia, confirme horários e acesse os links de atendimento.',
};

export default async function PatientAppointmentsPage() {
  const { data } = await getMyAppointmentsAction(0, 200, 'startDateTime,asc');

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <PatientAgendaView initialData={data} />
      </div>
    </div>
  );
}
