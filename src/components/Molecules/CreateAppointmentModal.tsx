'use client';

import { useState, useEffect } from 'react';
import type { AppointmentCreateDTO, MeetingType } from '@/types/appointment';
import type { ActiveConnectionDTO } from '@/types/connection';
import { getActiveConnectionsAction } from '@/actions/connections';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dto: AppointmentCreateDTO) => Promise<boolean | void>;
  isMutating: boolean;
  preselectedPatientId?: string;
  initialDate?: Date;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  isMutating,
  preselectedPatientId,
  initialDate,
}: Props) {
  const [patients, setPatients] = useState<ActiveConnectionDTO[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [meetingType, setMeetingType] = useState<MeetingType>('VIDEO_CALL');
  const [meetingLink, setMeetingLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setPatientId(preselectedPatientId || '');
    const targetDate = initialDate || new Date();
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setStartTime('14:00');
    setDurationMinutes(50);
    setMeetingType('VIDEO_CALL');
    setMeetingLink('');
    setTitle('');
    setDescription('');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setFormError(null);
  };

  const handleClose = () => {
    if (isMutating) return;
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const targetDate = initialDate || new Date();
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      setStartTime('14:00');
      setDurationMinutes(50);
      setMeetingType('VIDEO_CALL');
      setMeetingLink('');
      setTitle('');
      setDescription('');
      setCep('');
      setStreet('');
      setNumber('');
      setNeighborhood('');
      setCity('');
      setState('');
      setFormError(null);

      if (preselectedPatientId) {
        setPatientId(preselectedPatientId);
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialDate, preselectedPatientId]);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingPatients(true);
      getActiveConnectionsAction(0, 100)
        .then((res) => {
          if (res.data?.content) {
            setPatients(res.data.content);
            if (!preselectedPatientId && res.data.content.length > 0) {
              setPatientId((prev) => prev || res.data!.content[0].user.id);
            }
          }
        })
        .finally(() => setIsLoadingPatients(false));
    }
  }, [isOpen, preselectedPatientId]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientId) {
      setFormError('Selecione um paciente conectado.');
      return;
    }

    if (!date || !startTime) {
      setFormError('Selecione a data e o horário da consulta.');
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const startDateObj = new Date(startDateTime);
    if (startDateObj <= new Date()) {
      setFormError('A data e horário da consulta devem ser futuros.');
      return;
    }

    const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);
    const endYyyy = endDateObj.getFullYear();
    const endMm = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDd = String(endDateObj.getDate()).padStart(2, '0');
    const endHh = String(endDateObj.getHours()).padStart(2, '0');
    const endMin = String(endDateObj.getMinutes()).padStart(2, '0');
    const endDateTime = `${endYyyy}-${endMm}-${endDd}T${endHh}:${endMin}:00`;

    if (meetingType === 'VIDEO_CALL' && !meetingLink.trim()) {
      setFormError('Informe o link da chamada de vídeo (ex: Google Meet, Zoom).');
      return;
    }

    if (meetingType === 'IN_PERSON' && (!street.trim() || !city.trim() || !state.trim())) {
      setFormError('Preencha os campos obrigatórios do endereço (Rua, Cidade e Estado).');
      return;
    }

    const dto: AppointmentCreateDTO = {
      patientId,
      startDateTime,
      endDateTime,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      meetingType,
      meetingLink: meetingType === 'VIDEO_CALL' ? meetingLink.trim() : undefined,
      location:
        meetingType === 'IN_PERSON'
          ? {
            cep: cep.trim() || undefined,
            street: street.trim(),
            number: number.trim() || undefined,
            neighborhood: neighborhood.trim() || undefined,
            city: city.trim(),
            state: state.trim().toUpperCase(),
            country: 'Brasil',
          }
          : undefined,
    };

    const success = await onConfirm(dto);
    if (success !== false) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-[var(--primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Agendar Nova Consulta</h2>
              <p className="text-xs text-slate-500">Defina os detalhes e convide o paciente conectado</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isMutating}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Paciente <span className="text-red-500">*</span>
            </label>
            {isLoadingPatients ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : patients.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Você não possui pacientes conectados ativos. Conecte-se com pacientes primeiro para poder agendar consultas.
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
              >
                {patients.map((conn) => (
                  <option key={conn.user.id} value={conn.user.id}>
                    {conn.user.fullName} {conn.user.city ? `(${conn.user.city}, ${conn.user.state})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Horário de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Duração da Sessão</label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${durationMinutes === dur
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {dur} minutos
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Modalidade de Atendimento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMeetingType('VIDEO_CALL')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${meetingType === 'VIDEO_CALL'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Online (Vídeo)
              </button>

              <button
                type="button"
                onClick={() => setMeetingType('IN_PERSON')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${meetingType === 'IN_PERSON'
                  ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Presencial
              </button>
            </div>
          </div>

          {meetingType === 'VIDEO_CALL' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Link da Videochamada <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij ou link do Zoom"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700">Endereço do Consultório / Atendimento</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Número</label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500">Rua / Logradouro *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Av. Paulista, Sala 402"
                  required
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-slate-500">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bela Vista"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-slate-500">Cidade *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-slate-500">UF *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Título da Sessão (Opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Primeira Consulta de Avaliação"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Observações / Pauta (Opcional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anotações prévias ou orientações para o paciente..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isMutating}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isMutating || patients.length === 0}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isMutating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Agendando...
                </>
              ) : (
                'Criar Agendamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
