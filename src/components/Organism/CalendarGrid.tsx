'use client';

import type { AppointmentDTO, VirtualOccurrence } from '@/types/appointment';
import { generateMonthGrid, WEEK_DAYS, isSameDay } from '@/lib/calendar';
import { RECURRENCE_FREQUENCY_LABELS } from '@/lib/recurrence';

interface Props {
  currentDate: Date;
  selectedDate: Date;
  appointments: AppointmentDTO[];
  virtualOccurrences?: VirtualOccurrence[];
  perspective: 'psychologist' | 'patient';
  onSelectDate: (date: Date) => void;
  onOpenCreateModal?: (date: Date) => void;
  onViewAppointment?: (appointment: AppointmentDTO) => void;
}

export function CalendarGrid({
  currentDate,
  selectedDate,
  appointments,
  virtualOccurrences = [],
  perspective,
  onSelectDate,
  onOpenCreateModal,
  onViewAppointment,
}: Props) {
  const days = generateMonthGrid(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedDate,
    appointments
  );

  const isPsychologist = perspective === 'psychologist';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-3">
        {WEEK_DAYS.map((day, index) => (
          <span
            key={day}
            className={`text-xs font-bold uppercase tracking-wider ${index === 0 || index === 6 ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/20">
        {days.map((cell, idx) => {
          const dateNumber = cell.date.getDate();
          const cellVirtualOccurrences = virtualOccurrences.filter((occurrence) =>
            isSameDay(new Date(occurrence.startDateTime), cell.date)
          );
          const hasAppointments = cell.appointments.length > 0 || cellVirtualOccurrences.length > 0;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.date)}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${!cell.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-300'
                  : cell.isSelected
                    ? 'bg-blue-50/40 ring-2 ring-inset ring-[var(--primary)]'
                    : 'bg-white hover:bg-slate-50/80'
                }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${cell.isToday
                      ? 'bg-[var(--primary)] text-white shadow-2xs font-bold'
                      : cell.isSelected
                        ? 'text-[var(--primary)] font-bold'
                        : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                    }`}
                >
                  {dateNumber}
                </span>

                {isPsychologist && cell.isCurrentMonth && onOpenCreateModal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateModal(cell.date);
                    }}
                    title="Agendar neste dia"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[var(--primary)] hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                {cell.appointments.slice(0, 2).map((app) => {
                  const otherPerson = isPsychologist ? app.patient : app.psychologist;
                  const time = new Date(app.startDateTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let statusClasses = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (app.status === 'ACCEPTED') statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (app.status === 'CANCELLED') statusClasses = 'bg-red-50 text-red-600 border-red-200 opacity-60 line-through';

                  return (
                    <button
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAppointment) {
                          onViewAppointment(app);
                        } else {
                          onSelectDate(cell.date);
                        }
                      }}
                      className={`text-left px-1.5 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-medium truncate transition-all shadow-2xs hover:scale-[1.02] cursor-pointer flex items-center gap-1 ${statusClasses}`}
                    >
                      <span className="font-bold flex-shrink-0">{time}</span>
                      <span className="truncate">{otherPerson?.fullName || 'Consulta'}</span>
                    </button>
                  );
                })}

                {cell.appointments.length > 2 && (
                  <span className="text-[10px] font-semibold text-slate-500 pl-1">
                    +{cell.appointments.length - 2} mais
                  </span>
                )}

                {cell.appointments.length === 0 &&
                  cellVirtualOccurrences.slice(0, 2).map((occurrence, i) => {
                    const time = new Date(occurrence.startDateTime).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={`${occurrence.recurrenceRuleId}-${i}`}
                        title={`Ocorrência prevista da série ${RECURRENCE_FREQUENCY_LABELS[occurrence.frequency]}. Será confirmada quando a consulta anterior for concluída.`}
                        className="text-left px-1.5 py-0.5 rounded-md border border-dashed border-violet-300 bg-violet-50/60 text-violet-500 text-[10px] sm:text-[11px] font-medium truncate flex items-center gap-1"
                      >
                        <span className="font-bold flex-shrink-0">{time}</span>
                        <span className="truncate">Série {RECURRENCE_FREQUENCY_LABELS[occurrence.frequency]}</span>
                      </div>
                    );
                  })}
              </div>

              {hasAppointments && (
                <div className="flex items-center justify-center gap-1 mt-1 sm:hidden">
                  {cell.appointments.length === 0 &&
                    cellVirtualOccurrences.slice(0, 3).map((_, i) => (
                      <span key={`virtual-${i}`} className="w-1.5 h-1.5 rounded-full bg-violet-300" />
                    ))}
                  {cell.appointments.slice(0, 3).map((app, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${app.status === 'ACCEPTED'
                          ? 'bg-emerald-500'
                          : app.status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
