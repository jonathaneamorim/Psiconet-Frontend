'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import type { PaymentTiming, PaymentAdvanceUnit } from '@/types/payment';
import { updateBillingSettingsAction } from '@/actions/profile';

const TIMING_OPTIONS: { value: PaymentTiming; label: string; description: string }[] = [
  {
    value: 'BEFORE_APPOINTMENT',
    label: 'Antes da consulta',
    description: 'A cobrança é enviada ao paciente antes do horário da sessão.',
  },
  {
    value: 'AFTER_APPOINTMENT',
    label: 'Depois da consulta',
    description: 'A cobrança é enviada ao paciente após a realização da sessão.',
  },
];

const ADVANCE_UNIT_OPTIONS: { value: PaymentAdvanceUnit; label: string }[] = [
  { value: 'MINUTES', label: 'Minutos' },
  { value: 'DAYS', label: 'Dias' },
];

interface Props {
  initial?: {
    pixKey?: string;
    paymentTiming?: PaymentTiming;
    paymentAdvanceValue?: number;
    paymentAdvanceUnit?: PaymentAdvanceUnit;
  };
}

export function BillingSettingsForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>(initial?.paymentTiming ?? 'AFTER_APPOINTMENT');
  const [paymentAdvanceUnit, setPaymentAdvanceUnit] = useState<PaymentAdvanceUnit>(initial?.paymentAdvanceUnit ?? 'MINUTES');

  const handleSubmit = (formData: FormData) => {
    const pixKey = String(formData.get('pixKey') ?? '').trim();
    const paymentAdvanceValueRaw = String(formData.get('paymentAdvanceValue') ?? '').trim();
    const paymentAdvanceValue = paymentAdvanceValueRaw ? Number(paymentAdvanceValueRaw) : undefined;

    if (paymentAdvanceValueRaw && (Number.isNaN(paymentAdvanceValue) || (paymentAdvanceValue as number) < 0)) {
      toast.error('Informe um valor válido para a antecedência.');
      return;
    }

    if (paymentTiming === 'BEFORE_APPOINTMENT' && !paymentAdvanceValue) {
      toast.error('Informe a antecedência de cobrança (valor e unidade).');
      return;
    }

    startTransition(async () => {
      const result = await updateBillingSettingsAction({
        pixKey: pixKey || undefined,
        paymentTiming,
        paymentAdvanceValue,
        paymentAdvanceUnit: paymentAdvanceValue ? paymentAdvanceUnit : undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Configurações de cobrança atualizadas com sucesso!');
      }
    });
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-800">Configurações de Cobrança</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina como e quando os pagamentos das suas consultas serão solicitados aos pacientes.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pixKey" className="text-xs font-semibold text-slate-700">Chave Pix</label>
        <input
          id="pixKey"
          name="pixKey"
          type="text"
          defaultValue={initial?.pixKey ?? ''}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Momento da Cobrança</label>
        <div className="flex flex-col gap-2">
          {TIMING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${paymentTiming === option.value
                ? 'bg-blue-50 border-blue-300'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
            >
              <input
                type="radio"
                name="paymentTiming"
                value={option.value}
                checked={paymentTiming === option.value}
                onChange={() => setPaymentTiming(option.value)}
                className="mt-0.5 w-4 h-4 text-[var(--primary)] focus:ring-blue-500/30"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">{option.label}</p>
                <p className="text-[11px] text-slate-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {paymentTiming === 'BEFORE_APPOINTMENT' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="paymentAdvanceValue" className="text-xs font-semibold text-slate-700">
            Antecedência do Envio <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="paymentAdvanceValue"
              name="paymentAdvanceValue"
              type="number"
              min={1}
              placeholder="Ex: 60"
              defaultValue={initial?.paymentAdvanceValue ?? ''}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <select
              value={paymentAdvanceUnit}
              onChange={(e) => setPaymentAdvanceUnit(e.target.value as PaymentAdvanceUnit)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              {ADVANCE_UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-slate-400">
            Quanto tempo antes do horário da consulta a cobrança deve ser enviada ao paciente.
          </span>
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isPending ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </button>
      </div>
    </form>
  );
}
