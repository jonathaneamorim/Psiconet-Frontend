'use client';

import type { CalendarViewMode } from '@/types/appointment';
import { formatMonthYear } from '@/lib/calendar';

interface Props {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onOpenCreateModal?: () => void;
  createButtonLabel?: string;
  title?: string;
  subtitle?: string;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevMonth,
  onNextMonth,
  onToday,
  onViewModeChange,
  onOpenCreateModal,
  createButtonLabel = 'Nova Consulta',
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {title || 'Agenda de Consultas'}
          </h1>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>

        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-sm hover:shadow-md cursor-pointer flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {createButtonLabel}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200/60">
            <button
              onClick={onPrevMonth}
              aria-label="Mês anterior"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNextMonth}
              aria-label="Próximo mês"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Hoje
          </button>

          <span className="text-base sm:text-lg font-bold text-slate-800 ml-1">
            {formatMonthYear(currentDate)}
          </span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'month'
                ? 'bg-white text-[var(--primary)] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Mês
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'list'
                ? 'bg-white text-[var(--primary)] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Lista
          </button>
        </div>
      </div>
    </div>
  );
}
