'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
  AppointmentDTO,
  AppointmentCreateDTO,
  AppointmentStatus,
  CalendarViewMode,
} from '@/types/appointment';
import type { PaginatedResponse } from '@/types/connection';
import {
  getMyAppointmentsAction,
  createAppointmentAction,
  acceptAppointmentAction,
  cancelAppointmentAction,
} from '@/actions/appointments';
import { isSameDay } from '@/lib/calendar';
import toast from 'react-hot-toast';

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

  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === 'SCHEDULED').length;
    const accepted = appointments.filter((a) => a.status === 'ACCEPTED').length;
    const today = appointments.filter((a) => isSameDay(new Date(a.startDateTime), new Date())).length;
    return { total, scheduled, accepted, today };
  }, [appointments]);

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

  const handleAcceptAppointment = async (appointmentId: string) => {
    setIsMutating(true);
    try {
      const res = await acceptAppointmentAction(appointmentId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Consulta confirmada com sucesso!');
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: 'ACCEPTED' as const } : app))
      );
      if (detailsModalAppointment?.id === appointmentId) {
        setDetailsModalAppointment((prev) => (prev ? { ...prev, status: 'ACCEPTED' as const } : null));
      }
    } catch {
      toast.error('Erro ao aceitar consulta.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    setIsMutating(true);
    try {
      const res = await cancelAppointmentAction(appointmentId, reason);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Consulta cancelada.');
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
    handleAcceptAppointment,
    handleCancelAppointment,
    refresh,
  };
}
