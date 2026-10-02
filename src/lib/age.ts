/** Idade mínima para cadastro (Termos de Uso, 4.1). A regra vale no backend; aqui é só UX. */
export const MINIMUM_AGE = 18;

/** true se quem nasceu em `birthDate` (AAAA-MM-DD) já completou `years` anos em `today`. */
export function isAtLeastAge(birthDate: string, years: number, today: Date = new Date()): boolean {
  const [y, m, d] = birthDate.split('-').map(Number);
  if (!y || !m || !d) return false;
  const limit = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
  const birth = new Date(y, m - 1, d);
  return birth.getTime() <= limit.getTime();
}
