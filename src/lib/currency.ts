/**
 * Currency (BRL) utilities — sanitizeCurrencyInput, parseCurrencyToNumber
 *
 * All functions are pure and side-effect-free.
 * Safe to use in both server and client contexts.
 */

/**
 * Restringe o valor digitado a dígitos e uma única vírgula decimal (com no
 * máximo 2 casas), descartando qualquer outro caractere (letras, pontos, R$, etc).
 *
 * @example
 * sanitizeCurrencyInput("R$ 150,00") // "150,00"
 * sanitizeCurrencyInput("15o,5")     // "15,5"
 * sanitizeCurrencyInput("1,234,5")   // "1,2345" -> depois truncado para "1,23"
 */
export function sanitizeCurrencyInput(raw: string): string {
  let cleaned = raw.replace(/[^\d,]/g, '');

  const firstComma = cleaned.indexOf(',');
  if (firstComma !== -1) {
    cleaned = cleaned.slice(0, firstComma + 1) + cleaned.slice(firstComma + 1).replace(/,/g, '');
    const [intPart, decPart] = cleaned.split(',');
    if (decPart.length > 2) {
      cleaned = `${intPart},${decPart.slice(0, 2)}`;
    }
  }

  return cleaned;
}

/**
 * Converte o valor mascarado (vírgula como separador decimal) para number.
 *
 * @example
 * parseCurrencyToNumber("150,00") // 150
 * parseCurrencyToNumber("")       // NaN
 */
export function parseCurrencyToNumber(value: string): number {
  return Number(value.replace(',', '.'));
}
