'use client';

import { useState, useEffect } from 'react';
import type { AppointmentCreateDTO, LocationDTO, MeetingType } from '@/types/appointment';
import type { ActiveConnectionDTO } from '@/types/connection';
import type { RecurrenceFrequency, RecurrenceRuleCreateDTO, DayOfWeek } from '@/types/recurrence';
import { getActiveConnectionsAction } from '@/actions/connections';
import { getMyPsychologistProfileAction } from '@/actions/profile';
import { PriceInput } from './PriceInput';
import { DurationInput } from './DurationInput';
import { parseCurrencyToNumber } from '@/lib/currency';
import {
  RECURRENCE_FREQUENCY_LABELS,
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
  FREQUENCIES_WITH_WEEKDAY,
  FREQUENCIES_WITH_WEEKEND_ADJUSTMENT,
  FREQUENCIES_WITH_MONTH_DAY_LOCK,
  MONTH_STEP_BY_FREQUENCY,
  jsDayToDayOfWeek,
  nextDateForDayOfWeek,
  nextFirstDayOfMonth,
  nextLastDayOfMonth,
  dateStringMatchesDayOfWeek,
  dateStringIsFirstDayOfMonth,
  dateStringIsLastDayOfMonth,
} from '@/lib/recurrence';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dto: AppointmentCreateDTO) => Promise<boolean | void>;
  onConfirmRecurrence?: (treatmentLinkId: string, dto: RecurrenceRuleCreateDTO) => Promise<boolean | void>;
  isMutating: boolean;
  preselectedPatientId?: string;
  initialDate?: Date;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  onConfirmRecurrence,
  isMutating,
  preselectedPatientId,
  initialDate,
}: Props) {
  const [patients, setPatients] = useState<ActiveConnectionDTO[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [isRecurring, setIsRecurring] = useState(false);

  // Campos de consulta única
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [durationMinutes, setDurationMinutes] = useState(50);

  // Campos de recorrência
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [intervalDays, setIntervalDays] = useState(30);
  const [recurrenceStartTime, setRecurrenceStartTime] = useState('12:00');
  const [recurrenceEndTime, setRecurrenceEndTime] = useState('12:50');
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [adjustForWeekend, setAdjustForWeekend] = useState(false);
  const [recurrenceDateError, setRecurrenceDateError] = useState<string | null>(null);

  // Campos compartilhados
  const [meetingType, setMeetingType] = useState<MeetingType>('VIDEO_CALL');
  const [meetingLink, setMeetingLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);

  const [officeAddress, setOfficeAddress] = useState<LocationDTO | null>(null);
  const [addressMode, setAddressMode] = useState<'office' | 'custom'>('custom');

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const errorRing = (field: string) =>
    fieldErrors[field]
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

  const selectedPatient = patients.find((p) => p.user.id === patientId);

  const resetForm = () => {
    setPatientId(preselectedPatientId || '');
    setIsRecurring(false);
    const targetDate = initialDate || new Date();
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setStartTime('12:00');
    setDurationMinutes(50);
    setFrequency('WEEKLY');
    setDayOfWeek(jsDayToDayOfWeek(targetDate.getDay()));
    setIntervalDays(30);
    setRecurrenceStartTime('12:00');
    setRecurrenceEndTime('12:50');
    setRecurrenceStartDate(`${yyyy}-${mm}-${dd}`);
    setRecurrenceEndDate('');
    setAdjustForWeekend(false);
    setMeetingType('VIDEO_CALL');
    setMeetingLink('');
    setTitle('');
    setDescription('');
    setPrice('');
    setPriceTouched(false);
    setAddressMode('custom');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setFormError(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    if (isMutating) return;
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (preselectedPatientId) {
        setPatientId(preselectedPatientId);
      }
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Pré-preenche o preço com o valor padrão do vínculo ao trocar de paciente (editável manualmente)
  useEffect(() => {
    if (!priceTouched && selectedPatient?.user.defaultPrice != null) {
      setPrice(String(selectedPatient.user.defaultPrice).replace('.', ','));
    }
  }, [selectedPatient, priceTouched]);

  // Busca o endereço de consultório cadastrado nas configurações do psicólogo, para oferecer
  // como sugestão pré-preenchida ao marcar uma consulta presencial.
  useEffect(() => {
    if (!isOpen) return;

    getMyPsychologistProfileAction().then((res) => {
      const addr = res.data?.officeAddress;
      const hasAddr = Boolean(addr && addr.street && addr.city && addr.state);
      setOfficeAddress(hasAddr ? addr! : null);
    });
  }, [isOpen]);

  // Mantém os campos de endereço sincronizados com o consultório cadastrado enquanto esse modo
  // estiver selecionado — trocar para "Outro endereço" libera a edição manual dos campos.
  useEffect(() => {
    if (meetingType !== 'IN_PERSON' || addressMode !== 'office' || !officeAddress) return;

    setCep(officeAddress.cep || '');
    setStreet(officeAddress.street || '');
    setNumber(officeAddress.number || '');
    setNeighborhood(officeAddress.neighborhood || '');
    setCity(officeAddress.city || '');
    setState(officeAddress.state || '');
  }, [meetingType, addressMode, officeAddress]);

  const selectInPersonMeeting = () => {
    setMeetingType('IN_PERSON');
    if (officeAddress) {
      setAddressMode('office');
    } else {
      setAddressMode('custom');
    }
  };

  const selectCustomAddress = () => {
    setAddressMode('custom');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
  };

  // Mantém a data de início sempre compatível com a frequência escolhida: semanal/quinzenal
  // trava no dia da semana selecionado, primeiro/último dia do mês trava no respectivo dia.
  useEffect(() => {
    if (!isRecurring) return;

    if (FREQUENCIES_WITH_WEEKDAY.includes(frequency)) {
      if (!recurrenceStartDate || !dateStringMatchesDayOfWeek(recurrenceStartDate, dayOfWeek)) {
        setRecurrenceStartDate(nextDateForDayOfWeek(new Date(), dayOfWeek));
      }
    } else if (frequency === 'FIRST_DAY_OF_MONTH') {
      if (!recurrenceStartDate || !dateStringIsFirstDayOfMonth(recurrenceStartDate)) {
        setRecurrenceStartDate(nextFirstDayOfMonth(new Date()));
      }
    } else if (frequency === 'LAST_DAY_OF_MONTH') {
      if (!recurrenceStartDate || !dateStringIsLastDayOfMonth(recurrenceStartDate)) {
        setRecurrenceStartDate(nextLastDayOfMonth(new Date()));
      }
    }

    if (!FREQUENCIES_WITH_WEEKEND_ADJUSTMENT.includes(frequency)) {
      setAdjustForWeekend(false);
    }

    setRecurrenceDateError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, dayOfWeek, isRecurring]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!patientId) {
      setFormError('Selecione um paciente conectado.');
      setFieldErrors({ patient: true });
      return;
    }

    if (!isRecurring && (!durationMinutes || durationMinutes < 5)) {
      setFormError('Informe uma duração válida para a sessão (mínimo 5 minutos).');
      setFieldErrors({ duration: true });
      return;
    }

    if (meetingType === 'VIDEO_CALL' && !meetingLink.trim()) {
      setFormError('Informe o link da chamada de vídeo (ex: Google Meet, Zoom).');
      setFieldErrors({ meetingLink: true });
      return;
    }

    if (meetingType === 'IN_PERSON' && (!street.trim() || !city.trim() || !state.trim())) {
      setFormError('Preencha os campos obrigatórios do endereço (Rua, Cidade e Estado).');
      setFieldErrors({
        street: !street.trim(),
        city: !city.trim(),
        state: !state.trim(),
      });
      return;
    }

    const parsedPrice = price.trim() ? parseCurrencyToNumber(price) : undefined;
    if (price.trim() && (Number.isNaN(parsedPrice) || (parsedPrice as number) < 0)) {
      setFormError('Informe um preço válido.');
      setFieldErrors({ price: true });
      return;
    }

    const location =
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
        : undefined;

    if (isRecurring) {
      if (!onConfirmRecurrence) return;

      const treatmentLinkId = selectedPatient?.user.treatmentLinkId;
      if (!treatmentLinkId) {
        setFormError('Não foi possível identificar o vínculo de tratamento deste paciente.');
        setFieldErrors({ patient: true });
        return;
      }

      if (!recurrenceStartDate || !recurrenceStartTime || !recurrenceEndTime) {
        setFormError('Preencha a data de início e os horários da recorrência.');
        setFieldErrors({
          recurrenceStartDate: !recurrenceStartDate,
          recurrenceStartTime: !recurrenceStartTime,
          recurrenceEndTime: !recurrenceEndTime,
        });
        return;
      }

      if (FREQUENCIES_WITH_WEEKDAY.includes(frequency)) {
        if (!dayOfWeek) {
          setFormError('Selecione o dia da semana da recorrência.');
          setFieldErrors({ dayOfWeek: true });
          return;
        }
        if (!dateStringMatchesDayOfWeek(recurrenceStartDate, dayOfWeek)) {
          setFormError(`A data de início deve cair numa ${DAY_OF_WEEK_LABELS[dayOfWeek]}.`);
          setRecurrenceDateError(`Escolha uma data que caia numa ${DAY_OF_WEEK_LABELS[dayOfWeek]}.`);
          return;
        }
      }

      if (frequency === 'FIRST_DAY_OF_MONTH' && !dateStringIsFirstDayOfMonth(recurrenceStartDate)) {
        setFormError('A data de início deve ser o primeiro dia do mês.');
        setFieldErrors({ recurrenceStartDate: true });
        return;
      }

      if (frequency === 'LAST_DAY_OF_MONTH' && !dateStringIsLastDayOfMonth(recurrenceStartDate)) {
        setFormError('A data de início deve ser o último dia do mês.');
        setFieldErrors({ recurrenceStartDate: true });
        return;
      }

      if (frequency === 'EVERY_N_DAYS' && (!intervalDays || intervalDays < 1)) {
        setFormError('Informe a cada quantos dias a consulta deve se repetir.');
        setFieldErrors({ intervalDays: true });
        return;
      }

      const dto: RecurrenceRuleCreateDTO = {
        frequency,
        dayOfWeek: FREQUENCIES_WITH_WEEKDAY.includes(frequency) ? dayOfWeek : undefined,
        intervalDays: frequency === 'EVERY_N_DAYS' ? intervalDays : undefined,
        startTime: `${recurrenceStartTime}:00`,
        endTime: `${recurrenceEndTime}:00`,
        startDate: recurrenceStartDate,
        endDate: recurrenceEndDate || undefined,
        title: title.trim() || undefined,
        meetingType,
        meetingLink: meetingType === 'VIDEO_CALL' ? meetingLink.trim() : undefined,
        location,
        price: parsedPrice,
        adjustForWeekend,
      };

      const success = await onConfirmRecurrence(treatmentLinkId, dto);
      if (success !== false) {
        handleClose();
      }
      return;
    }

    if (!date || !startTime) {
      setFormError('Selecione a data e o horário da consulta.');
      setFieldErrors({ date: !date, startTime: !startTime });
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const startDateObj = new Date(startDateTime);
    if (startDateObj <= new Date()) {
      setFormError('A data e horário da consulta devem ser futuros.');
      setFieldErrors({ date: true, startTime: true });
      return;
    }

    const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);
    const endYyyy = endDateObj.getFullYear();
    const endMm = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDd = String(endDateObj.getDate()).padStart(2, '0');
    const endHh = String(endDateObj.getHours()).padStart(2, '0');
    const endMin = String(endDateObj.getMinutes()).padStart(2, '0');
    const endDateTime = `${endYyyy}-${endMm}-${endDd}T${endHh}:${endMin}:00`;

    const dto: AppointmentCreateDTO = {
      patientId,
      startDateTime,
      endDateTime,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      meetingType,
      meetingLink: meetingType === 'VIDEO_CALL' ? meetingLink.trim() : undefined,
      location,
      price: parsedPrice,
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
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setPriceTouched(false);
                  clearFieldError('patient');
                }}
                required
                className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('patient')}`}
              >
                {patients.map((conn) => (
                  <option key={conn.user.id} value={conn.user.id}>
                    {conn.user.fullName} {conn.user.city ? `(${conn.user.city}, ${conn.user.state})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {onConfirmRecurrence && (
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-blue-500/30"
              />
              <span className="text-xs font-semibold text-slate-700">Consulta recorrente</span>
            </label>
          )}

          {isRecurring ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Frequência <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  >
                    {Object.entries(RECURRENCE_FREQUENCY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {FREQUENCIES_WITH_WEEKDAY.includes(frequency) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Dia da Semana <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => {
                        setDayOfWeek(e.target.value as DayOfWeek);
                        clearFieldError('dayOfWeek');
                      }}
                      className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('dayOfWeek')}`}
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>{DAY_OF_WEEK_LABELS[d]}</option>
                      ))}
                    </select>
                  </div>
                )}

                {frequency === 'EVERY_N_DAYS' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Repetir a cada quantos dias <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={intervalDays}
                      onChange={(e) => {
                        setIntervalDays(Number(e.target.value));
                        clearFieldError('intervalDays');
                      }}
                      required
                      className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('intervalDays')}`}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Horário de Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={recurrenceStartTime}
                    onChange={(e) => {
                      setRecurrenceStartTime(e.target.value);
                      clearFieldError('recurrenceStartTime');
                    }}
                    required
                    className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('recurrenceStartTime')}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Horário de Término <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={recurrenceEndTime}
                    onChange={(e) => {
                      setRecurrenceEndTime(e.target.value);
                      clearFieldError('recurrenceEndTime');
                    }}
                    required
                    className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('recurrenceEndTime')}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Data de Início <span className="text-red-500">*</span>
                  </label>

                  {frequency === 'FIRST_DAY_OF_MONTH' || frequency === 'LAST_DAY_OF_MONTH' ? (
                    <>
                      <input
                        type="month"
                        min={todayStr.slice(0, 7)}
                        value={recurrenceStartDate.slice(0, 7)}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [yyyy, mm] = e.target.value.split('-').map(Number);
                          setRecurrenceStartDate(
                            frequency === 'FIRST_DAY_OF_MONTH'
                              ? nextFirstDayOfMonth(new Date(yyyy, mm - 1, 1))
                              : nextLastDayOfMonth(new Date(yyyy, mm - 1, 1))
                          );
                          clearFieldError('recurrenceStartDate');
                        }}
                        required
                        className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('recurrenceStartDate')}`}
                      />
                      <span className="text-[11px] text-slate-400">
                        Começa no {frequency === 'FIRST_DAY_OF_MONTH' ? 'primeiro' : 'último'} dia do mês escolhido.
                      </span>
                    </>
                  ) : (
                    <>
                      <input
                        type="date"
                        min={
                          FREQUENCIES_WITH_WEEKDAY.includes(frequency)
                            ? nextDateForDayOfWeek(new Date(), dayOfWeek)
                            : todayStr
                        }
                        step={FREQUENCIES_WITH_WEEKDAY.includes(frequency) ? 7 : undefined}
                        value={recurrenceStartDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRecurrenceStartDate(value);
                          clearFieldError('recurrenceStartDate');
                          if (FREQUENCIES_WITH_WEEKDAY.includes(frequency) && !dateStringMatchesDayOfWeek(value, dayOfWeek)) {
                            setRecurrenceDateError(`Escolha uma data que caia numa ${DAY_OF_WEEK_LABELS[dayOfWeek]}.`);
                          } else {
                            setRecurrenceDateError(null);
                          }
                        }}
                        required
                        className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${recurrenceDateError || fieldErrors.recurrenceStartDate ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                      />
                      {recurrenceDateError && (
                        <span className="text-[11px] font-medium text-red-500">{recurrenceDateError}</span>
                      )}
                      {FREQUENCIES_WITH_MONTH_DAY_LOCK.includes(frequency) && recurrenceStartDate && (
                        <span className="text-[11px] text-slate-400">
                          Repetirá todo dia {Number(recurrenceStartDate.split('-')[2])} de{' '}
                          {MONTH_STEP_BY_FREQUENCY[frequency] === 1
                            ? 'cada mês'
                            : `a cada ${MONTH_STEP_BY_FREQUENCY[frequency]} meses`}
                          . Em meses mais curtos que não têm esse dia, cai automaticamente no último dia do mês.
                        </span>
                      )}

                      {frequency === 'EVERY_N_DAYS' && recurrenceStartDate && (
                        <span className="text-[11px] text-slate-400">
                          Repetirá a cada {intervalDays} {intervalDays === 1 ? 'dia' : 'dias'} a partir desta data,
                          podendo cair em qualquer dia da semana (inclusive fins de semana).
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Data de Término (Opcional)</label>
                  <input
                    type="date"
                    min={recurrenceStartDate || todayStr}
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              {FREQUENCIES_WITH_WEEKEND_ADJUSTMENT.includes(frequency) && (
                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjustForWeekend}
                    onChange={(e) => setAdjustForWeekend(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-blue-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-700">Antecipar para a sexta-feira se cair em fim de semana</span>
                </label>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    clearFieldError('date');
                  }}
                  required
                  className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('date')}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Horário de Início <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearFieldError('startTime');
                  }}
                  required
                  className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${errorRing('startTime')}`}
                />
              </div>
            </div>
          )}

          {!isRecurring && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Duração da Sessão (minutos) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(dur);
                      clearFieldError('duration');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${durationMinutes === dur
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
              <label htmlFor="durationMinutes" className="text-[11px] font-medium text-slate-500 mt-0.5">
                Ou informe um valor personalizado (minutos):
              </label>
              <DurationInput
                id="durationMinutes"
                value={durationMinutes}
                onChange={(value) => {
                  setDurationMinutes(value);
                  clearFieldError('duration');
                }}
                placeholder="Ex: 50"
                hasError={fieldErrors.duration}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Preço da Consulta (Opcional)</label>
            <PriceInput
              value={price}
              onChange={(value) => {
                setPrice(value);
                setPriceTouched(true);
                clearFieldError('price');
              }}
              placeholder="150,00"
              hasError={fieldErrors.price}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Modalidade de Atendimento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMeetingType('VIDEO_CALL');
                  clearFieldError('street');
                  clearFieldError('city');
                  clearFieldError('state');
                }}
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
                onClick={() => {
                  selectInPersonMeeting();
                  clearFieldError('meetingLink');
                }}
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
                onChange={(e) => {
                  setMeetingLink(e.target.value);
                  clearFieldError('meetingLink');
                }}
                placeholder="https://meet.google.com/abc-defg-hij ou link do Zoom"
                required
                className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all ${errorRing('meetingLink')}`}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700">Endereço do Consultório / Atendimento</p>

              {officeAddress && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddressMode('office')}
                    className={`py-2 px-3 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${addressMode === 'office'
                      ? 'bg-teal-50 border-teal-300 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    Meu Consultório
                  </button>
                  <button
                    type="button"
                    onClick={selectCustomAddress}
                    className={`py-2 px-3 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${addressMode === 'custom'
                      ? 'bg-teal-50 border-teal-300 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    Outro Endereço
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    disabled={addressMode === 'office'}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Número</label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 120"
                    disabled={addressMode === 'office'}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500">Rua / Logradouro *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    clearFieldError('street');
                  }}
                  placeholder="Av. Paulista, Sala 402"
                  required
                  disabled={addressMode === 'office'}
                  className={`w-full text-xs p-2 rounded-lg border bg-white disabled:bg-slate-100 disabled:text-slate-500 ${fieldErrors.street ? 'border-red-400' : 'border-slate-200'}`}
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
                    disabled={addressMode === 'office'}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-slate-500">Cidade *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldError('city');
                    }}
                    placeholder="São Paulo"
                    required
                    disabled={addressMode === 'office'}
                    className={`w-full text-xs p-2 rounded-lg border bg-white disabled:bg-slate-100 disabled:text-slate-500 ${fieldErrors.city ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-slate-500">UF *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value.toUpperCase());
                      clearFieldError('state');
                    }}
                    placeholder="SP"
                    required
                    disabled={addressMode === 'office'}
                    className={`w-full text-xs p-2 rounded-lg border bg-white uppercase disabled:bg-slate-100 disabled:text-slate-500 ${fieldErrors.state ? 'border-red-400' : 'border-slate-200'}`}
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

          {!isRecurring && (
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
          )}

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
