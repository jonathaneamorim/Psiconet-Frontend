import Link from 'next/link';
import { getMeProfileAction } from '@/actions/profile';
import { getMyAppointmentsAction } from '@/actions/appointments';
import { getActiveConnectionsAction } from '@/actions/connections';
import { ROUTES } from '@/config/routes';
import { AppointmentStatusBadge } from '@/components/Atoms/AppointmentStatusBadge';
import { MeetingTypeBadge } from '@/components/Atoms/MeetingTypeBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
  isSameDay,
} from '@/lib/calendar';

export const metadata = {
  title: 'Dashboard do Psicólogo | Psiconet',
  description: 'Painel principal do psicólogo com resumo de atendimentos, agenda do dia e pacientes.',
};

export default async function DashboardPsicologo() {
  const [profileRes, appointmentsRes, connectionsRes] = await Promise.all([
    getMeProfileAction(),
    getMyAppointmentsAction(0, 50, 'startDateTime,asc'),
    getActiveConnectionsAction(0, 4),
  ]);

  const profile = profileRes.data;
  const appointments = appointmentsRes.data?.content || [];
  const connections = connectionsRes.data?.content || [];
  const totalConnections = connectionsRes.data?.page.totalElements || 0;

  const now = new Date();
  const todayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.startDateTime), now)
  );

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.startDateTime) >= now && a.status !== 'CANCELLED')
    .slice(0, 4);

  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const nextSession = upcomingAppointments[0];

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
                  Painel Clínico
                </span>
                <span className="text-xs text-blue-100 font-medium capitalize">{todayFormatted}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Olá, {profile?.fullName || 'Psicólogo(a)'}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Bem-vindo ao seu painel. Veja suas consultas agendadas e acompanhe seus pacientes.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Link
              href={ROUTES.PSYCHOLOGIST_APPOINTMENTS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Marcar Consulta
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultas Hoje</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{todayAppointments.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendentes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-700">{pendingAppointmentsCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pacientes Ativos</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalConnections}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Agendamentos</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
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
                  <h2 className="text-base font-bold text-slate-800">Próximos Atendimentos</h2>
                  <p className="text-xs text-slate-400">Suas consultas mais recentes agendadas</p>
                </div>
              </div>

              <Link
                href={ROUTES.PSYCHOLOGIST_APPOINTMENTS}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Ver Agenda Completa →
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 font-medium">Nenhum atendimento futuro agendado.</p>
                <Link
                  href={ROUTES.PSYCHOLOGIST_APPOINTMENTS}
                  className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  + Agendar nova consulta
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
                        {app.patient.photoUrl ? (
                          <img src={app.patient.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          app.patient.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{app.patient.fullName}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatAppointmentDate(app.startDateTime)} • {formatAppointmentTime(app.startDateTime, app.endDateTime)} ({calculateDurationMinutes(app.startDateTime, app.endDateTime)} min)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <MeetingTypeBadge type={app.meetingType} size="sm" />
                      <AppointmentStatusBadge status={app.status} size="sm" />
                      {app.meetingType === 'VIDEO_CALL' && app.meetingLink && app.status === 'ACCEPTED' && (
                        <a
                          href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-2xs"
                        >
                          Entrar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">Meus Pacientes</h2>
                <Link
                  href={ROUTES.PSYCHOLOGIST_CONNECTIONS}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Ver Todos ({totalConnections})
                </Link>
              </div>

              {connections.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Você ainda não tem pacientes conectados.
                  <Link
                    href={ROUTES.PSYCHOLOGIST_SEARCH}
                    className="block mt-1 text-[var(--primary)] font-semibold hover:underline"
                  >
                    Buscar Pacientes
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
                          <p className="text-[11px] text-slate-400 truncate">{conn.user.city ? `${conn.user.city}, ${conn.user.state}` : 'Paciente'}</p>
                        </div>
                      </div>

                      <Link
                        href={`/psychologist/appointments?patientId=${conn.user.id}`}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[var(--primary)] text-[11px] font-bold rounded-lg transition-colors flex-shrink-0"
                      >
                        Agendar
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
                  href={ROUTES.PSYCHOLOGIST_APPOINTMENTS}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  📅 Minha Agenda
                </Link>
                <Link
                  href={ROUTES.PSYCHOLOGIST_SEARCH}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  🔍 Buscar Pacientes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}