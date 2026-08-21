'use client';

import Link from 'next/link';
import type { AppointmentDTO } from '@/types/appointment';
import { AppointmentStatusBadge } from '@/components/Atoms/AppointmentStatusBadge';
import { MeetingTypeBadge } from '@/components/Atoms/MeetingTypeBadge';
import {
  formatAppointmentDate,
  formatAppointmentTime,
  calculateDurationMinutes,
  formatFullDateTime,
} from '@/lib/calendar';

interface Props {
  appointment: AppointmentDTO | null;
  perspective: 'psychologist' | 'patient';
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onCancel?: (appointment: AppointmentDTO) => void;
  isMutating?: boolean;
}

export function AppointmentDetailsModal({
  appointment,
  perspective,
  isOpen,
  onClose,
  onAccept,
  onCancel,
  isMutating = false,
}: Props) {
  if (!isOpen || !appointment) return null;

  const isPsychologist = perspective === 'psychologist';
  const isScheduled = appointment.status === 'SCHEDULED';
  const isAccepted = appointment.status === 'ACCEPTED';
  const isCancelled = appointment.status === 'CANCELLED';

  const duration = calculateDurationMinutes(appointment.startDateTime, appointment.endDateTime);

  const formattedAddress = appointment.location
    ? [
      appointment.location.street,
      appointment.location.number,
      appointment.location.complement,
      appointment.location.neighborhood,
      appointment.location.city,
      appointment.location.state,
      appointment.location.cep,
    ]
      .filter(Boolean)
      .join(', ')
    : '';

  const mapsUrl = formattedAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-[var(--primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Detalhes da Consulta</h2>
              <p className="text-xs text-slate-500">
                Criada em {formatFullDateTime(appointment.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Modalidade:</span>
              <MeetingTypeBadge type={appointment.meetingType} />
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[var(--primary)] shadow-2xs flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {formatAppointmentDate(appointment.startDateTime)}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {formatAppointmentTime(appointment.startDateTime, appointment.endDateTime)} ({duration} minutos)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden flex-shrink-0">
                {appointment.psychologist.photoUrl ? (
                  <img src={appointment.psychologist.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  appointment.psychologist.fullName.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Psicólogo(a)</span>
                <p className="text-xs font-bold text-slate-800 truncate">{appointment.psychologist.fullName}</p>
                <Link
                  href={`/psychologist/profile/${appointment.psychologist.id}`}
                  className="text-[11px] text-[var(--primary)] hover:underline"
                  onClick={onClose}
                >
                  Ver Perfil
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden flex-shrink-0">
                {appointment.patient.photoUrl ? (
                  <img src={appointment.patient.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  appointment.patient.fullName.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Paciente</span>
                <p className="text-xs font-bold text-slate-800 truncate">{appointment.patient.fullName}</p>
                <Link
                  href={`/patient/profile/${appointment.patient.id}`}
                  className="text-[11px] text-[var(--primary)] hover:underline"
                  onClick={onClose}
                >
                  Ver Perfil
                </Link>
              </div>
            </div>
          </div>

          {appointment.title && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Título da Sessão</span>
              <p className="text-sm font-semibold text-slate-800">{appointment.title}</p>
            </div>
          )}

          {appointment.description && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Observações / Pauta</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                {appointment.description}
              </p>
            </div>
          )}

          {appointment.meetingType === 'VIDEO_CALL' && appointment.meetingLink && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col gap-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Link da Reunião Online
              </span>
              <p className="text-xs text-indigo-700 font-mono break-all">{appointment.meetingLink}</p>
              {isAccepted && (
                <a
                  href={appointment.meetingLink.startsWith('http') ? appointment.meetingLink : `https://${appointment.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Acessar Sala de Atendimento
                </a>
              )}
            </div>
          )}

          {appointment.meetingType === 'IN_PERSON' && formattedAddress && (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col gap-2">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Endereço de Atendimento
              </span>
              <p className="text-xs text-teal-800 leading-relaxed">{formattedAddress}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Abrir no Google Maps →
                </a>
              )}
            </div>
          )}

          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-1.5">
              <p className="text-xs font-bold text-red-800">
                Cancelada por: {appointment.cancelledBy === 'PATIENT' ? 'Paciente' : 'Psicólogo'}
              </p>
              {appointment.cancellationReason && (
                <p className="text-xs text-red-700 italic">
                  Motivo: "{appointment.cancellationReason}"
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {(isScheduled || isAccepted) && onCancel ? (
            <button
              onClick={() => {
                onClose();
                onCancel(appointment);
              }}
              disabled={isMutating}
              className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              {!isPsychologist && isScheduled ? 'Recusar Consulta' : 'Cancelar Consulta'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {!isPsychologist && isScheduled && onAccept && (
              <button
                onClick={() => {
                  onAccept(appointment.id);
                  onClose();
                }}
                disabled={isMutating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Aceitar Consulta
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
