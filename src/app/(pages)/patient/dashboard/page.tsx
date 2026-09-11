import Link from 'next/link';
import { getMeProfileAction } from '@/actions/profile';
import { getMyAppointmentsAction } from '@/actions/appointments';
import { getActiveConnectionsAction } from '@/actions/connections';
import { getFinancialSummaryAction } from '@/actions/payments';
import { FinancialSummaryCard } from '@/components/Organism/FinancialSummaryCard';
import { ROUTES } from '@/config/routes';
import { AppointmentStatusBadge } from '@/components/Atoms/AppointmentStatusBadge';
import { MeetingTypeBadge } from '@/components/Atoms/MeetingTypeBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
} from '@/lib/calendar';

export const metadata = {
  title: 'Dashboard do Paciente | Psiconet',
  description: 'Seu espaço pessoal de cuidado emocional, consultas marcadas e psicólogos conectados.',
};

export default async function DashboardPaciente() {
  const [profileRes, appointmentsRes, connectionsRes, financialSummaryRes] = await Promise.all([
    getMeProfileAction(),
    getMyAppointmentsAction(0, 50, 'startDateTime,asc'),
    getActiveConnectionsAction(0, 4),
    getFinancialSummaryAction(),
  ]);

  const profile = profileRes.data;
  const appointments = appointmentsRes.data?.content || [];
  const connections = connectionsRes.data?.content || [];
  const totalConnections = connectionsRes.data?.page.totalElements || 0;
  const financialSummary = financialSummaryRes.data;

  const now = new Date();
  const upcomingAppointments = appointments
    .filter((a) => new Date(a.startDateTime) >= now && a.status !== 'CANCELLED')
    .slice(0, 4);

  const nextAppointment = upcomingAppointments[0];

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-2xl text-white overflow-hidden flex-shrink-0 shadow-inner">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.fullName?.charAt(0) || 'P'
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Espaço do Paciente
                </span>
                <span className="text-xs text-blue-100 font-medium capitalize">{todayFormatted}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Olá, {profile?.fullName || 'Paciente'}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Como você está se sentindo hoje? Acompanhe suas consultas e cuide do seu bem-estar.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Link
              href={ROUTES.PATIENT_APPOINTMENTS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Minhas Consultas
            </Link>
          </div>
        </div>

        {nextAppointment && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-50 text-[var(--primary)] text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Próxima Sessão
                </span>
                <AppointmentStatusBadge status={nextAppointment.status} size="sm" />
                <MeetingTypeBadge type={nextAppointment.meetingType} size="sm" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {formatAppointmentDate(nextAppointment.startDateTime)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {formatAppointmentTime(nextAppointment.startDateTime, nextAppointment.endDateTime)} ({calculateDurationMinutes(nextAppointment.startDateTime, nextAppointment.endDateTime)} minutos)
                </p>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden flex-shrink-0">
                  {nextAppointment.psychologist.photoUrl ? (
                    <img src={nextAppointment.psychologist.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    nextAppointment.psychologist.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{nextAppointment.psychologist.fullName}</p>
                  <p className="text-xs text-slate-400">Psicólogo(a)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {nextAppointment.meetingType === 'VIDEO_CALL' && nextAppointment.meetingLink && (
                <a
                  href={nextAppointment.meetingLink.startsWith('http') ? nextAppointment.meetingLink : `https://${nextAppointment.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Entrar na Consulta Online
                </a>
              )}

              <Link
                href={ROUTES.PATIENT_APPOINTMENTS}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Ver Detalhes da Agenda
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultas Futuras</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{upcomingAppointments.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Psicólogos Conectados</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalConnections}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Consultas</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{appointments.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Próximas Sessões</h2>
                  <p className="text-xs text-slate-400">Suas consultas marcadas</p>
                </div>
              </div>

              <Link
                href={ROUTES.PATIENT_APPOINTMENTS}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Ver Todas →
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 font-medium">Você não possui consultas futuras marcadas.</p>
                <Link
                  href={ROUTES.PATIENT_SEARCH}
                  className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Buscar um Psicólogo para se conectar
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden flex-shrink-0">
                        {app.psychologist.photoUrl ? (
                          <img src={app.psychologist.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          app.psychologist.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{app.psychologist.fullName}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatAppointmentDate(app.startDateTime)} • {formatAppointmentTime(app.startDateTime, app.endDateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <MeetingTypeBadge type={app.meetingType} size="sm" />
                      <AppointmentStatusBadge status={app.status} size="sm" />
                      <Link
                        href={ROUTES.PATIENT_APPOINTMENTS}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[var(--primary)] text-xs font-semibold rounded-xl transition-colors"
                      >
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {financialSummary && <FinancialSummaryCard summary={financialSummary} perspective="patient" />}

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">Meus Psicólogos</h2>
                <Link
                  href={ROUTES.PATIENT_CONNECTIONS}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Ver Todos ({totalConnections})
                </Link>
              </div>

              {connections.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Você ainda não tem conexões com psicólogos.
                  <Link
                    href={ROUTES.PATIENT_SEARCH}
                    className="block mt-1 text-[var(--primary)] font-semibold hover:underline"
                  >
                    Buscar Psicólogos
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {connections.map((conn) => (
                    <div
                      key={conn.connectionId}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden flex-shrink-0">
                          {conn.user.photoUrl ? (
                            <img src={conn.user.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            conn.user.fullName.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{conn.user.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {conn.user.crp ? `CRP: ${conn.user.crp}` : 'Psicólogo(a)'}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/psychologist/profile/${conn.user.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors flex-shrink-0"
                      >
                        Perfil
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col gap-3 shadow-md">
              <h3 className="text-sm font-bold">Acesso Rápido</h3>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link
                  href={ROUTES.PATIENT_APPOINTMENTS}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  📅 Minhas Consultas
                </Link>
                <Link
                  href={ROUTES.PATIENT_SEARCH}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  🔍 Buscar Psicólogos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}