'use client';

import { useState } from 'react';
import type { AppointmentDTO, AppointmentCancelScope } from '@/types/appointment';
import { formatAppointmentDate, formatAppointmentTime } from '@/lib/calendar';

interface Props {
  appointment: AppointmentDTO | null;
  perspective: 'psychologist' | 'patient';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentId: string, reason?: string, cancelScope?: AppointmentCancelScope) => Promise<void>;
  isMutating: boolean;
}

const SCOPE_OPTIONS: { value: AppointmentCancelScope; label: string; description: string }[] = [
  { value: 'SINGLE', label: 'Apenas esta consulta', description: 'Cancela somente esta ocorrência da série.' },
  { value: 'THIS_AND_FOLLOWING', label: 'Esta e as seguintes', description: 'Cancela esta e todas as próximas ocorrências.' },
  { value: 'ALL_SERIES', label: 'Toda a série', description: 'Cancela todas as consultas da recorrência.' },
];

export function CancelAppointmentModal({
  appointment,
  perspective,
  isOpen,
  onClose,
  onConfirm,
  isMutating,
}: Props) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [cancelScope, setCancelScope] = useState<AppointmentCancelScope>('SINGLE');

  if (!isOpen || !appointment) return null;

  const isPatient = perspective === 'patient';
  const otherPerson = isPatient ? appointment.psychologist : appointment.patient;
  const showScopeSelector = !isPatient && !!appointment.recurrenceRuleId;

  const modalTitle = 'Cancelar Consulta';
  const modalDescription = `Tem certeza de que deseja cancelar a consulta agendada com ${otherPerson.fullName}?`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPatient && !reason.trim()) {
      setError('Por favor, informe o motivo do cancelamento.');
      return;
    }

    setError('');
    await onConfirm(appointment.id, reason.trim(), isPatient ? 'SINGLE' : cancelScope);
    setReason('');
  };

  const handleClose = () => {
    if (isMutating) return;
    setReason('');
    setError('');
    setCancelScope('SINGLE');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{modalTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{modalDescription}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex flex-col gap-1.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              {formatAppointmentDate(appointment.startDateTime)} • {formatAppointmentTime(appointment.startDateTime, appointment.endDateTime)}
            </p>
            <p className="text-slate-500">
              Profissional: <span className="font-medium text-slate-700">{appointment.psychologist.fullName}</span>
            </p>
            <p className="text-slate-500">
              Paciente: <span className="font-medium text-slate-700">{appointment.patient.fullName}</span>
            </p>
          </div>

          {showScopeSelector && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Esta consulta faz parte de uma série recorrente. O que deseja cancelar?
              </label>
              <div className="flex flex-col gap-2">
                {SCOPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${cancelScope === option.value
                      ? 'bg-red-50 border-red-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="cancel-scope"
                      value={option.value}
                      checked={cancelScope === option.value}
                      onChange={() => setCancelScope(option.value)}
                      className="mt-0.5 w-4 h-4 text-red-600 focus:ring-red-500/30"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{option.label}</p>
                      <p className="text-[11px] text-slate-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-700">
              Motivo do Cancelamento {isPatient && <span className="text-red-500">*</span>}
              {!isPatient && <span className="text-slate-400 font-normal ml-1">(Opcional)</span>}
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isPatient
                  ? 'Ex: Tive um imprevisto no trabalho / Gostaria de reagendar para outro dia...'
                  : 'Informe um motivo ou observação (opcional)...'
              }
              className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all resize-none ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
            />
            {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isMutating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isMutating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
