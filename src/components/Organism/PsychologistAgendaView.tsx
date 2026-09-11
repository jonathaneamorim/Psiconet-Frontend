'use client';

import type { PaginatedResponse } from '@/types/connection';
import type { AppointmentDTO } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import { CalendarHeader } from '@/components/Molecules/CalendarHeader';
import { CalendarGrid } from '@/components/Organism/CalendarGrid';
import { AppointmentCard } from '@/components/Molecules/AppointmentCard';
import { CreateAppointmentModal } from '@/components/Molecules/CreateAppointmentModal';
import { CancelAppointmentModal } from '@/components/Molecules/CancelAppointmentModal';
import { AppointmentDetailsModal } from '@/components/Molecules/AppointmentDetailsModal';
import { formatAppointmentDate } from '@/lib/calendar';

interface Props {
  initialData?: PaginatedResponse<AppointmentDTO>;
  preselectedPatientId?: string;
}

export function PsychologistAgendaView({ initialData, preselectedPatientId }: Props) {
  const {
    filteredAppointments,
    selectedDateAppointments,
    currentDate,
    selectedDate,
    viewMode,
    statusFilter,
    searchQuery,
    isLoading,
    isMutating,
    stats,
    virtualOccurrences,
    isCreateModalOpen,
    createModalPatientId,
    createModalDate,
    cancelModalAppointment,
    detailsModalAppointment,
    setViewMode,
    setStatusFilter,
    setSearchQuery,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleSelectDate,
    openCreateModal,
    closeCreateModal,
    openCancelModal,
    closeCancelModal,
    openDetailsModal,
    closeDetailsModal,
    handleCreateAppointment,
    handleCreateRecurrence,
    handleCancelAppointment,
  } = useAppointments({ initialData, perspective: 'psychologist' });

  return (
    <div className="flex flex-col gap-6">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onViewModeChange={setViewMode}
        onOpenCreateModal={() => openCreateModal(preselectedPatientId)}
        createButtonLabel="Marcar Nova Consulta"
        title="Agenda de Consultas"
        subtitle="Gerencie seus horários, agende sessões com pacientes conectados e acompanhe confirmações."
      />

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
              { key: 'ALL', label: 'Todos' },
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
            placeholder="Buscar por paciente ou título..."
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
              perspective="psychologist"
              onSelectDate={handleSelectDate}
              onOpenCreateModal={(date) => openCreateModal(undefined, date)}
              onViewAppointment={openDetailsModal}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {formatAppointmentDate(selectedDate.toISOString())}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedDateAppointments.length}{' '}
                    {selectedDateAppointments.length === 1 ? 'consulta agendada' : 'consultas agendadas'}
                  </p>
                </div>

                <button
                  onClick={() => openCreateModal(undefined, selectedDate)}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-[var(--primary)] rounded-xl transition-colors cursor-pointer"
                  title="Agendar neste dia"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {selectedDateAppointments.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Nenhuma consulta agendada para este dia.</p>
                  <button
                    onClick={() => openCreateModal(undefined, selectedDate)}
                    className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    + Agendar consulta agora
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDateAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      perspective="psychologist"
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
                <h3 className="text-base font-bold text-slate-800">Nenhum agendamento encontrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Tente alterar os filtros ou o termo de busca.'
                    : 'Você ainda não possui consultas agendadas. Clique no botão acima para agendar uma nova consulta.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((app) => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  perspective="psychologist"
                  onCancel={openCancelModal}
                  onViewDetails={openDetailsModal}
                  isMutating={isMutating}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onConfirm={handleCreateAppointment}
        onConfirmRecurrence={handleCreateRecurrence}
        isMutating={isMutating}
        preselectedPatientId={createModalPatientId}
        initialDate={createModalDate}
      />

      <CancelAppointmentModal
        appointment={cancelModalAppointment}
        perspective="psychologist"
        isOpen={!!cancelModalAppointment}
        onClose={closeCancelModal}
        onConfirm={handleCancelAppointment}
        isMutating={isMutating}
      />

      <AppointmentDetailsModal
        appointment={detailsModalAppointment}
        perspective="psychologist"
        isOpen={!!detailsModalAppointment}
        onClose={closeDetailsModal}
        onCancel={openCancelModal}
        isMutating={isMutating}
      />
    </div>
  );
}
