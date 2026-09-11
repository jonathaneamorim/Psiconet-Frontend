import type { FinancialSummaryDTO } from '@/types/payment';

interface Props {
  summary: FinancialSummaryDTO;
  perspective: 'psychologist' | 'patient';
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function FinancialSummaryCard({ summary, perspective }: Props) {
  const isPsychologist = perspective === 'psychologist';
  const monthLabel = MONTH_NAMES[summary.month - 1] ?? '';

  const confirmedLabel = isPsychologist ? 'Recebido' : 'Pago';
  const outstandingLabel = isPsychologist ? 'A Receber' : 'A Pagar';

  const breakdown = [
    { label: 'Aguardando comprovante', count: summary.pendingCount, amount: summary.pendingAmount, color: 'text-slate-500' },
    { label: 'Aguardando aprovação', count: summary.awaitingReviewCount, amount: summary.awaitingReviewAmount, color: 'text-amber-600' },
    { label: 'Contestado', count: summary.disputedCount, amount: summary.disputedAmount, color: 'text-violet-600' },
    { label: 'Rejeitado', count: summary.rejectedCount, amount: summary.rejectedAmount, color: 'text-red-600' },
  ].filter((item) => item.count > 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Financeiro</h2>
            <p className="text-xs text-slate-400 capitalize">{monthLabel} de {summary.year}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">{confirmedLabel}</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-800">{formatCurrency(summary.confirmedAmount)}</span>
          <span className="text-[11px] text-emerald-600">
            {summary.confirmedCount} {summary.confirmedCount === 1 ? 'pessoa confirmou' : 'pessoas confirmaram'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">{outstandingLabel}</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-800">{formatCurrency(summary.outstandingAmount)}</span>
          <span className="text-[11px] text-amber-600">
            {summary.outstandingCount} {summary.outstandingCount === 1 ? 'pendência' : 'pendências'}
          </span>
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="flex flex-col gap-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{item.label} ({item.count})</span>
              <span className={`font-semibold ${item.color}`}>{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">Total esperado no mês</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(summary.totalExpectedAmount)}</span>
      </div>
    </div>
  );
}
