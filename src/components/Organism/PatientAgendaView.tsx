'use client';

import Link from 'next/link';
import type { PaginatedResponse } from '@/types/connection';
import type { AppointmentDTO } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import { CalendarHeader } from '@/components/Molecules/CalendarHeader';
import { CalendarGrid } from '@/components/Organism/CalendarGrid';
import { AppointmentCard } from '@/components/Molecules/AppointmentCard';
import { CancelAppointmentModal } from '@/components/Molecules/CancelAppointmentModal';
import { AppointmentDetailsModal } from '@/components/Molecules/AppointmentDetailsModal';
import { AppointmentStatusBadge } from '@/components/Atoms/AppointmentStatusBadge';
import { MeetingTypeBadge } from '@/components/Atoms/MeetingTypeBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
} from '@/lib/calendar';

interface Props {
  initialData?: PaginatedResponse<AppointmentDTO>;
}

export function PatientAgendaView({ initialData }: Props) {
  const {
    appointments,
    filteredAppointments,
    selectedDateAppointments,
    currentDate,
    selectedDate,
    viewMode,
    statusFilter,
    searchQuery,
    isMutating,
    stats,
    virtualOccurrences,
    cancelModalAppointment,
    detailsModalAppointment,
    setViewMode,
    setStatusFilter,
    setSearchQuery,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleSelectDate,
    openCancelModal,
    closeCancelModal,
    openDetailsModal,
    closeDetailsModal,
    handleCancelAppointment,
  } = useAppointments({ initialData, perspective: 'patient' });

  const now = new Date();
  const nextAppointment = appointments
    .filter((a) => a.status === 'ACCEPTED' && new Date(a.startDateTime) >= now)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())[0];

  return (
    <div className="flex flex-col gap-6">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onViewModeChange={setViewMode}
        title="Minhas Consultas"
        subtitle="Acompanhe sua agenda de sessões e acesse suas salas de atendimento."
      />

      {nextAppointment && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Próxima Consulta
                </span>
                <AppointmentStatusBadge status={nextAppointment.status} size="sm" />
                <MeetingTypeBadge type={nextAppointment.meetingType} size="sm" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {formatAppointmentDate(nextAppointment.startDateTime)}
                </h2>
                <p className="text-sm text-blue-100 mt-0.5 font-medium">
                  {formatAppointmentTime(nextAppointment.startDateTime, nextAppointment.endDateTime)} • Duração de {calculateDurationMinutes(nextAppointment.startDateTime, nextAppointment.endDateTime)} min
                </p>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0">
                  {nextAppointment.psychologist.photoUrl ? (
                    <img src={nextAppointment.psychologist.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    nextAppointment.psychologist.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{nextAppointment.psychologist.fullName}</p>
                  <p className="text-xs text-blue-200">Psicólogo(a)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {nextAppointment.meetingType === 'VIDEO_CALL' && nextAppointment.meetingLink ? (
                <a
                  href={nextAppointment.meetingLink.startsWith('http') ? nextAppointment.meetingLink : `https://${nextAppointment.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Entrar na Consulta Online
                </a>
              ) : null}

              <button
                onClick={() => openDetailsModal(nextAppointment)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{stats.today}</p>
            <p className="text-xs text-slate-400 font-medium">Hoje</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-700">{stats.accepted}</p>
            <p className="text-xs text-slate-400 font-medium">Confirmadas</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-400 font-medium">Total no Mês</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: 'Todas' },
              { key: 'ACCEPTED', label: 'Confirmadas' },
              { key: 'CANCELLED', label: 'Canceladas' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${statusFilter === tab.key
                  ? 'bg-[var(--primary)] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por psicólogo ou título..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              virtualOccurrences={virtualOccurrences}
              perspective="patient"
              onSelectDate={handleSelectDate}
              onViewAppointment={openDetailsModal}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">
                  {formatAppointmentDate(selectedDate.toISOString())}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedDateAppointments.length}{' '}
                  {selectedDateAppointments.length === 1 ? 'consulta agendada' : 'consultas agendadas'}
                </p>
              </div>

              {selectedDateAppointments.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Nenhuma consulta agendada para este dia.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDateAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      perspective="patient"
                      onCancel={openCancelModal}
                      onViewDetails={openDetailsModal}
                      isMutating={isMutating}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[var(--primary)] flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Nenhuma consulta encontrada</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Tente alterar os filtros ou o termo de busca.'
                    : 'Você ainda não possui consultas marcadas. Seus psicólogos conectados agendarão as sessões que aparecerão aqui.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((app) => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  perspective="patient"
                  onCancel={openCancelModal}
                  onViewDetails={openDetailsModal}
                  isMutating={isMutating}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CancelAppointmentModal
        appointment={cancelModalAppointment}
        perspective="patient"
        isOpen={!!cancelModalAppointment}
        onClose={closeCancelModal}
        onConfirm={handleCancelAppointment}
        isMutating={isMutating}
      />

      <AppointmentDetailsModal
        appointment={detailsModalAppointment}
        perspective="patient"
        isOpen={!!detailsModalAppointment}
        onClose={closeDetailsModal}
        onCancel={openCancelModal}
        isMutating={isMutating}
      />
    </div>
  );
}
