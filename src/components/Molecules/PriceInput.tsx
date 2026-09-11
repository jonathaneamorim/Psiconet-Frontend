'use client';

import { sanitizeCurrencyInput } from '@/lib/currency';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  autoFocus?: boolean;
  required?: boolean;
}

/**
 * PriceInput — campo de valor em reais com prefixo "R$" fixo e máscara que só
 * aceita dígitos e uma vírgula decimal (nenhum outro caractere é inserido).
 * O valor mantido no estado usa vírgula como separador decimal (ex: "150,00"),
 * consistente com o padrão já usado nos formulários (parseCurrencyToNumber).
 */
export function PriceInput({ id, value, onChange, placeholder = '0,00', hasError, autoFocus, required }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(sanitizeCurrencyInput(e.target.value));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (e.key === ',') {
      if (value.includes(',')) e.preventDefault();
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    onChange(sanitizeCurrencyInput(value + e.clipboardData.getData('text')));
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoFocus={autoFocus}
        required={required}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`w-full text-xs p-3 pl-9 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all ${hasError
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          }`}
      />
    </div>
  );
}
