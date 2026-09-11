'use client';

import Link from 'next/link';
import type { AppointmentDTO } from '@/types/appointment';
import { AppointmentStatusBadge } from '@/components/Atoms/AppointmentStatusBadge';
import { MeetingTypeBadge } from '@/components/Atoms/MeetingTypeBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
} from '@/lib/calendar';
import { RECURRENCE_FREQUENCY_LABELS } from '@/lib/recurrence';

interface Props {
  appointment: AppointmentDTO;
  perspective: 'psychologist' | 'patient';
  onCancel?: (appointment: AppointmentDTO) => void;
  onViewDetails?: (appointment: AppointmentDTO) => void;
  isMutating?: boolean;
}

export function AppointmentCard({
  appointment,
  perspective,
  onCancel,
  onViewDetails,
  isMutating = false,
}: Props) {
  const isPsychologist = perspective === 'psychologist';
  const otherPerson = isPsychologist ? appointment.patient : appointment.psychologist;
  const otherPersonRole = isPsychologist ? 'Paciente' : 'Psicólogo(a)';
  const profileUrl = isPsychologist
    ? `/psychologist/profile/${otherPerson.id}`
    : `/patient/profile/${otherPerson.id}`;

  const duration = calculateDurationMinutes(appointment.startDateTime, appointment.endDateTime);
  const timeFormatted = formatAppointmentTime(appointment.startDateTime, appointment.endDateTime);
  const dateFormatted = formatAppointmentDate(appointment.startDateTime);

  const isAccepted = appointment.status === 'ACCEPTED';
  const isCancelled = appointment.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">{dateFormatted}</p>
            <p className="text-xs text-slate-500 font-medium">{timeFormatted} ({duration} min)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MeetingTypeBadge type={appointment.meetingType} size="sm" />
          <AppointmentStatusBadge status={appointment.status} size="sm" />
        </div>
      </div>

      {appointment.recurrenceRuleId && (
        <span
          title="A próxima ocorrência desta série será agendada automaticamente após esta."
          className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200/80 rounded-full text-[11px] font-semibold -mt-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Consulta periódica
          {appointment.recurrenceFrequency && ` • ${RECURRENCE_FREQUENCY_LABELS[appointment.recurrenceFrequency]}`}
        </span>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={profileUrl} className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:border-[var(--primary)] transition-colors">
              {otherPerson.photoUrl ? (
                <img
                  src={otherPerson.photoUrl}
                  alt={otherPerson.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-slate-400">
                  {otherPerson.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </Link>

          <div className="min-w-0">
            <Link href={profileUrl}>
              <h3 className="text-base font-bold text-slate-800 hover:text-[var(--primary)] transition-colors truncate">
                {otherPerson.fullName}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 font-medium truncate">
              {otherPersonRole}
              {appointment.title && appointment.title !== `${appointment.psychologist?.fullName} X ${appointment.patient?.fullName}` && (
                <span className="ml-1.5 text-slate-600 font-semibold">• {appointment.title}</span>
              )}
            </p>
          </div>
        </div>

        {appointment.meetingType === 'VIDEO_CALL' && appointment.meetingLink && isAccepted && (
          <a
            href={appointment.meetingLink.startsWith('http') ? appointment.meetingLink : `https://${appointment.meetingLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-2xs flex-shrink-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Entrar na Chamada
          </a>
        )}
      </div>

      {appointment.description && (
        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
          {appointment.description}
        </p>
      )}

      {appointment.meetingType === 'IN_PERSON' && appointment.location && (
        <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">
            {[
              appointment.location.street,
              appointment.location.number,
              appointment.location.neighborhood,
              appointment.location.city,
              appointment.location.state,
            ]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      )}

      {isCancelled && appointment.cancellationReason && (
        <div className="bg-red-50/70 border border-red-200/60 p-3 rounded-xl text-xs text-red-700 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cancelada por {appointment.cancelledBy === 'PATIENT' ? 'Paciente' : 'Psicólogo'}:
          </div>
          <p className="pl-5 italic text-red-600">"{appointment.cancellationReason}"</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-1">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(appointment)}
            className="text-xs font-semibold text-slate-600 hover:text-[var(--primary)] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Ver detalhes
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {isAccepted && onCancel && (
            <button
              onClick={() => onCancel(appointment)}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
