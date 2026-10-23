import Link from 'next/link';
import { getAppointmentAction } from '@/actions/appointments';
import { getActiveConnectionsAction } from '@/actions/connections';
import { CallLoader } from '@/components/Organism/VideoCall/CallLoader';
import { RoleEnum } from '@/enums/RoleEnum';
import { getUserRole } from '@/lib/auth';
import { isInAppVideo } from '@/lib/videoCall';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Sessão online | Psiconet',
  description: 'Sala de vídeo da sessão entre psicólogo e paciente.',
};

// Credenciais e estado da sala nunca são cacheados.
export const dynamic = 'force-dynamic';

/*
 * Página da chamada (psicólogo e paciente). O backend é quem decide se o usuário participa da
 * consulta e se a sala está aberta; aqui só carregamos os dados de exibição e o SDK de vídeo — este
 * de forma dinâmica, apenas nesta página.
 */
export default async function CallPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const [appointmentResult, role] = await Promise.all([getAppointmentAction(appointmentId), getUserRole()]);
  const agendaHref = role === RoleEnum.PSYCHOLOGIST ? ROUTES.PSYCHOLOGIST_APPOINTMENTS : ROUTES.PATIENT_APPOINTMENTS;

  const appointment = appointmentResult.data;
  if (!appointment || !isInAppVideo(appointment)) {
    return (
      <section className="max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800">
          {appointment ? 'Esta consulta não usa a Sala Psiconet' : 'Consulta não encontrada'}
        </h1>
        <p className="text-sm text-slate-500">
          {appointment
            ? 'A chamada desta consulta acontece por um link externo. Use o botão "Entrar na chamada" na sua agenda.'
            : 'A consulta não existe ou você não participa dela.'}
        </p>
        <Link href={agendaHref} className="px-4 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">
          Voltar para a agenda
        </Link>
      </section>
    );
  }

  // Ponto de extensão das anotações: o psicólogo abre o prontuário do vínculo em outra aba sem sair da chamada.
  let recordHref: string | undefined;
  if (role === RoleEnum.PSYCHOLOGIST) {
    const connections = await getActiveConnectionsAction(0, 100);
    const linkId = connections.data?.content.find((c) => c.user.id === appointment.patient.id)?.user.treatmentLinkId;
    if (linkId) recordHref = `${ROUTES.PSYCHOLOGIST_MEDICAL_RECORDS}/${linkId}`;
  }

  return (
    <CallLoader
      appointment={appointment}
      isHost={role === RoleEnum.PSYCHOLOGIST}
      agendaHref={agendaHref}
      recordHref={recordHref}
    />
  );
}
