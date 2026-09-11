'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  isMutating: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean | void>;
}

export function RejectPaymentModal({ isOpen, isMutating, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isMutating) return;
    setReason('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Informe o motivo da rejeição.');
      return;
    }

    setError('');
    const success = await onConfirm(reason.trim());
    if (success !== false) {
      handleClose();
    }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Rejeitar Pagamento</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Informe o motivo da rejeição para que o paciente possa corrigir e reenviar o comprovante.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reject-reason" className="text-xs font-semibold text-slate-700">
              Motivo da Rejeição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: O valor do comprovante não corresponde ao combinado..."
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
                  Rejeitando...
                </>
              ) : (
                'Confirmar Rejeição'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
