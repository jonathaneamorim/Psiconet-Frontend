/** Espelha a política de senha do backend (PasswordPolicy.java) — o backend continua sendo a autoridade. */
export const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
export const PASSWORD_POLICY_MESSAGE =
  'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.';

export function validatePassword(password: string): string | null {
  return PASSWORD_POLICY_REGEX.test(password) ? null : PASSWORD_POLICY_MESSAGE;
}
