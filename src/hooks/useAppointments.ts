'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  AppointmentDTO,
  AppointmentCreateDTO,
  AppointmentStatus,
  AppointmentCancelScope,
  AppointmentStatsDTO,
  VirtualOccurrence,
  CalendarViewMode,
} from '@/types/appointment';
import type { RecurrenceRuleCreateDTO } from '@/types/recurrence';
import type { PaginatedResponse } from '@/types/connection';
import {
  getMyAppointmentsAction,
  createAppointmentAction,
  cancelAppointmentAction,
  getAppointmentStatsAction,
} from '@/actions/appointments';
import { createRecurrenceRuleAction, previewRecurrenceRuleAction } from '@/actions/recurrenceRules';
import { isSameDay } from '@/lib/calendar';
import toast from 'react-hot-toast';

const EMPTY_STATS: AppointmentStatsDTO = {
  accepted: 0,
  completed: 0,
  cancelled: 0,
  noShow: 0,
};

function toDateParam(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface UseAppointmentsOptions {
  initialData?: PaginatedResponse<AppointmentDTO>;
  perspective: 'psychologist' | 'patient';
}

export function useAppointments({ initialData, perspective }: UseAppointmentsOptions) {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>(
    initialData?.content || []
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalPatientId, setCreateModalPatientId] = useState<string | undefined>(undefined);
  const [createModalDate, setCreateModalDate] = useState<Date | undefined>(undefined);

  const [cancelModalAppointment, setCancelModalAppointment] = useState<AppointmentDTO | null>(null);
  const [detailsModalAppointment, setDetailsModalAppointment] = useState<AppointmentDTO | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMyAppointmentsAction(0, 200, 'startDateTime,asc');
      if (res.data?.content) {
        setAppointments(res.data.content);
      }
    } catch {
      toast.error('Erro ao atualizar agendamentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const otherPerson = perspective === 'psychologist' ? app.patient : app.psychologist;
        const nameMatch = otherPerson?.fullName?.toLowerCase().includes(query);
        const titleMatch = app.title?.toLowerCase().includes(query);
        const descMatch = app.description?.toLowerCase().includes(query);
        if (!nameMatch && !titleMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery, perspective]);

  const selectedDateAppointments = useMemo(() => {
    return filteredAppointments.filter((app) =>
      isSameDay(new Date(app.startDateTime), selectedDate)
    );
  }, [filteredAppointments, selectedDate]);

  // Estatísticas do mês exibido no calendário (não do total histórico do usuário).
  const [monthStats, setMonthStats] = useState<AppointmentStatsDTO>(EMPTY_STATS);

  useEffect(() => {
    let cancelled = false;
    getAppointmentStatsAction(currentDate.getFullYear(), currentDate.getMonth() + 1).then((res) => {
      if (!cancelled && res.data) {
        setMonthStats(res.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  const stats = useMemo(() => {
    const today = appointments.filter((a) => isSameDay(new Date(a.startDateTime), new Date())).length;
    const total =
      monthStats.accepted + monthStats.completed + monthStats.cancelled + monthStats.noShow;
    return { total, accepted: monthStats.accepted, today };
  }, [appointments, monthStats]);

  // Ocorrências futuras (ainda não materializadas) das séries recorrentes presentes na
  // lista, calculadas via preview da regra — para o calendário exibir a série completa
  // sem depender do backend gerar um Appointment real por instância.
  const [virtualOccurrences, setVirtualOccurrences] = useState<VirtualOccurrence[]>([]);

  const activeRecurrenceRuleIds = useMemo(() => {
    const ids = new Set<string>();
    appointments.forEach((app) => {
      if (app.recurrenceRuleId && app.status !== 'CANCELLED') {
        ids.add(app.recurrenceRuleId);
      }
    });
    return Array.from(ids);
  }, [appointments]);

  useEffect(() => {
    if (activeRecurrenceRuleIds.length === 0) {
      setVirtualOccurrences([]);
      return;
    }

    let cancelled = false;
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const from = toDateParam(monthStart);
    const to = toDateParam(new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000));

    Promise.all(
      activeRecurrenceRuleIds.map(async (ruleId) => {
        const res = await previewRecurrenceRuleAction(ruleId, from, to);
        const frequency = appointments.find((a) => a.recurrenceRuleId === ruleId)?.recurrenceFrequency;
        if (!res.data || !frequency) return [];
        return res.data.map<VirtualOccurrence>((startDateTime) => ({
          recurrenceRuleId: ruleId,
          frequency,
          startDateTime,
        }));
      })
    ).then((results) => {
      if (!cancelled) {
        setVirtualOccurrences(results.flat());
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRecurrenceRuleIds, currentDate]);

  // Não duplica no calendário: some a ocorrência virtual do dia em que já existe
  // um Appointment real (materializado) da mesma série.
  const visibleVirtualOccurrences = useMemo(() => {
    return virtualOccurrences.filter(
      (occurrence) =>
        !appointments.some(
          (app) =>
            app.recurrenceRuleId === occurrence.recurrenceRuleId &&
            isSameDay(new Date(app.startDateTime), new Date(occurrence.startDateTime))
        )
    );
  }, [virtualOccurrences, appointments]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const openCreateModal = (patientId?: string, date?: Date) => {
    setCreateModalPatientId(patientId);
    setCreateModalDate(date || selectedDate);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateModalPatientId(undefined);
    setCreateModalDate(undefined);
  };

  const openCancelModal = (appointment: AppointmentDTO) => {
    setCancelModalAppointment(appointment);
  };

  const closeCancelModal = () => {
    setCancelModalAppointment(null);
  };

  const openDetailsModal = (appointment: AppointmentDTO) => {
    setDetailsModalAppointment(appointment);
  };

  const closeDetailsModal = () => {
    setDetailsModalAppointment(null);
  };

  const handleCreateAppointment = async (dto: AppointmentCreateDTO) => {
    setIsMutating(true);
    try {
      const res = await createAppointmentAction(dto);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Consulta agendada com sucesso!');
      if (res.data) {
        setAppointments((prev) => [...prev, res.data!].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()));
      } else {
        await refresh();
      }
      return true;
    } catch {
      toast.error('Erro ao criar agendamento.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateRecurrence = async (treatmentLinkId: string, dto: RecurrenceRuleCreateDTO) => {
    setIsMutating(true);
    try {
      const res = await createRecurrenceRuleAction(treatmentLinkId, dto);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Consulta recorrente criada com sucesso!');
      await refresh();
      return true;
    } catch {
      toast.error('Erro ao criar consulta recorrente.');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancelAppointment = async (
    appointmentId: string,
    reason?: string,
    cancelScope?: AppointmentCancelScope
  ) => {
    setIsMutating(true);
    try {
      const res = await cancelAppointmentAction(appointmentId, reason, cancelScope);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Consulta cancelada.');

      if (cancelScope && cancelScope !== 'SINGLE') {
        // Múltiplos agendamentos da série podem ter sido afetados: recarrega a lista inteira.
        await refresh();
      } else {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId
              ? {
                ...app,
                status: 'CANCELLED' as const,
                cancelledBy: perspective === 'psychologist' ? 'PSYCHOLOGIST' : 'PATIENT',
                cancellationReason: reason,
              }
              : app
          )
        );
      }

      closeCancelModal();
      if (detailsModalAppointment?.id === appointmentId) {
        setDetailsModalAppointment((prev) =>
          prev
            ? {
              ...prev,
              status: 'CANCELLED' as const,
              cancelledBy: perspective === 'psychologist' ? 'PSYCHOLOGIST' : 'PATIENT',
              cancellationReason: reason,
            }
            : null
        );
      }
    } catch {
      toast.error('Erro ao cancelar consulta.');
    } finally {
      setIsMutating(false);
    }
  };

  return {
    appointments,
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
    virtualOccurrences: visibleVirtualOccurrences,
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
    refresh,
  };
}
