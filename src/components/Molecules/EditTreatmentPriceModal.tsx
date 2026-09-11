'use client';

import { useState } from 'react';
import { PriceInput } from './PriceInput';
import { parseCurrencyToNumber } from '@/lib/currency';

interface Props {
  isOpen: boolean;
  patientName: string;
  currentPrice?: number;
  isMutating: boolean;
  onClose: () => void;
  onConfirm: (price: number) => Promise<boolean | void>;
}

export function EditTreatmentPriceModal({
  isOpen,
  patientName,
  currentPrice,
  isMutating,
  onClose,
  onConfirm,
}: Props) {
  const [price, setPrice] = useState(currentPrice != null ? String(currentPrice).replace('.', ',') : '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isMutating) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = parseCurrencyToNumber(price);
    if (price.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
      setError('Informe um valor válido.');
      return;
    }

    setError('');
    const success = await onConfirm(parsed);
    if (success !== false) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Preço Padrão da Sessão</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Defina o valor padrão cobrado de <span className="font-semibold text-slate-700">{patientName}</span> por consulta. Você ainda pode ajustar o valor individualmente ao criar cada agendamento.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="default-price" className="text-xs font-semibold text-slate-700">
              Valor (R$)
            </label>
            <PriceInput
              id="default-price"
              value={price}
              onChange={(value) => {
                setPrice(value);
                if (error) setError('');
              }}
              placeholder="150,00"
              autoFocus
              hasError={!!error}
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
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isMutating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar Preço'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
