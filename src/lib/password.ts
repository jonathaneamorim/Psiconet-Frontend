/** Espelha a política de senha do backend (PasswordPolicy.java) — o backend continua sendo a autoridade. */
export const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
export const PASSWORD_POLICY_MESSAGE =
  'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.';

/** O BCrypt só usa os primeiros 72 bytes (UTF-8): acima disso o backend recusa. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MAX_BYTES_MESSAGE =
  'A senha pode ter no máximo 72 bytes (cerca de 72 caracteres sem acento ou 36 acentuados).';

/** Tamanho em bytes UTF-8, por code point (sem depender de TextEncoder, ausente em alguns ambientes). */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

export function validatePassword(password: string): string | null {
  if (utf8ByteLength(password) > PASSWORD_MAX_BYTES) return PASSWORD_MAX_BYTES_MESSAGE;
  return PASSWORD_POLICY_REGEX.test(password) ? null : PASSWORD_POLICY_MESSAGE;
}
