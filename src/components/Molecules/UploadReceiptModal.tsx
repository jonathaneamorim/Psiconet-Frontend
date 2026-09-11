'use client';

import { useState, useRef } from 'react';

interface Props {
  isOpen: boolean;
  isMutating: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<boolean | void>;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

export function UploadReceiptModal({ isOpen, isMutating, onClose, onConfirm }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isMutating) return;
    setFile(null);
    setError('');
    onClose();
  };

  const handleFileChange = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Formato inválido. Envie uma imagem (PNG/JPG) ou PDF.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('Arquivo muito grande. O limite é de 10MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione o arquivo do comprovante.');
      return;
    }

    const success = await onConfirm(file);
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
            <h2 className="text-lg font-bold text-slate-800">Enviar Comprovante</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Envie o comprovante de pagamento (PNG, JPG ou PDF, até 10MB) para revisão do psicólogo.
            </p>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
              }`}
          >
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {file ? (
              <p className="text-xs font-semibold text-slate-700">{file.name}</p>
            ) : (
              <p className="text-xs text-slate-500 text-center">Clique para selecionar o arquivo</p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}

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
                  Enviando...
                </>
              ) : (
                'Enviar Comprovante'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
