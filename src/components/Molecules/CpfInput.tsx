'use client';

import { useId, useState, useRef } from 'react';
import { maskCpf, normalizeCpf, validateCpfLength } from '@/lib/cpf';

interface Props {
  /** Errors from backend or parent form state */
  error?: string;
  /** Called when the field receives focus (clears error) */
  onClearError?: () => void;
  /** Label style override */
  labelStyle?: string;
  /** Input style override */
  inputStyle?: string;
}

/**
 * CpfInput — controlled CPF input with automatic mask.
 *
 * Renders two elements:
 * - A visible <input> that displays the masked value (e.g. "123.456.789-01")
 * - A hidden <input name="cpf"> that holds the normalized value (e.g. "12345678901")
 *   This is what gets submitted to the server action / FormData.
 *
 * Usage:
 * <CpfInput error={fieldErrors["cpf"]} onClearError={() => clearFieldError("cpf")} />
 */
export function CpfInput({ error, onClearError, labelStyle, inputStyle }: Props) {
  const id = useId();
  const [masked, setMasked] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = normalizeCpf(masked);
  const activeError = error || validationError;

  function applyMask(raw: string) {
    const next = maskCpf(raw);
    setMasked(next);
    // Clear validation error while user is still typing
    if (validationError) setValidationError('');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyMask(e.target.value);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    applyMask(pasted);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Allow: backspace, delete, tab, escape, arrows, home, end
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    if (allowed.includes(e.key)) return;

    // Allow Ctrl/Cmd combinations (copy, paste, select all, etc.)
    if (e.ctrlKey || e.metaKey) return;

    // Block non-digit characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Block if already at 11 digits
    if (normalizeCpf(masked).length >= 11) {
      e.preventDefault();
    }
  }

  function handleBlur() {
    if (masked && !validateCpfLength(masked)) {
      setValidationError('CPF deve ter 11 dígitos.');
    }
  }

  function handleFocus() {
    setValidationError('');
    onClearError?.();
  }

  return (
    <div className="flex flex-col gap-1">
      {activeError && (
        <span className="mt-2 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 animate-pulse-once">
          ⚠ {activeError}
        </span>
      )}

      <label
        htmlFor={id}
        className={`block text-sm font-semibold text-slate-700 text-left ${labelStyle ?? ''}`}
      >
        CPF
      </label>

      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="000.000.000-00"
        maxLength={14} /* 11 digits + 3 formatting chars */
        value={masked}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={`border border-slate-200 bg-slate-50 text-slate-900 text-sm rounded-xl block w-full px-4 py-3 shadow-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
          activeError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-300'
            : ''
        } ${inputStyle ?? ''}`}
        aria-label="CPF"
        aria-describedby={activeError ? `${id}-error` : undefined}
        aria-invalid={!!activeError}
      />

      {/* Hidden input that carries the normalized value in FormData */}
      <input
        type="hidden"
        name="cpf"
        value={normalized}
      />
    </div>
  );
}
