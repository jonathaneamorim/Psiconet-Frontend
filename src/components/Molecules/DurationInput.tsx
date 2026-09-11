'use client';

interface Props {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  hasError?: boolean;
  required?: boolean;
  maxLength?: number;
}

/**
 * DurationInput — campo de duração em minutos que só aceita dígitos (nenhum
 * outro caractere é inserido), no mesmo esquema visual do PriceInput.
 */
export function DurationInput({ id, value, onChange, placeholder = 'Ex: 50', hasError, required, maxLength = 3 }: Props) {
  const displayValue = value > 0 ? String(value) : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(digits === '' ? 0 : Number(digits));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = (displayValue + e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, maxLength);
    onChange(digits === '' ? 0 : Number(digits));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      required={required}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium ${hasError
          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
          : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
        }`}
    />
  );
}
