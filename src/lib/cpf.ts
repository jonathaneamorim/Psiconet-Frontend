/**
 * CPF Utilities — maskCpf, normalizeCpf, validateCpf
 *
 * All functions are pure and side-effect-free.
 * Safe to use in both server and client contexts.
 */

/**
 * Remove todos os caracteres não numéricos do CPF.
 * Garante que o backend nunca receba CPF formatado.
 *
 * @example
 * normalizeCpf("123.456.789-01") // "12345678901"
 * normalizeCpf("123abc456789")   // "12345678900" → truncado a 11 dígitos
 */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/**
 * Aplica a máscara brasileira de CPF em tempo real.
 * Funciona para digitação progressiva e para o valor completo.
 *
 * @example
 * maskCpf("12345678901")  // "123.456.789-01"
 * maskCpf("123456")       // "123.456"
 * maskCpf("")             // ""
 */
export function maskCpf(value: string): string {
  const digits = normalizeCpf(value);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Verifica se um CPF (normalizado ou não) tem exatamente 11 dígitos.
 * Não valida matematicamente — apenas comprimento.
 *
 * @example
 * validateCpfLength("12345678901")   // true
 * validateCpfLength("123.456.789-01") // true (normaliza internamente)
 * validateCpfLength("1234567890")    // false
 */
export function validateCpfLength(value: string): boolean {
  return normalizeCpf(value).length === 11;
}
