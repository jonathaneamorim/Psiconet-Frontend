import { PASSWORD_MAX_BYTES_MESSAGE, PASSWORD_POLICY_MESSAGE, validatePassword } from '../password';

describe('validatePassword (espelho da política do backend)', () => {
  it('aceita senha que cumpre a regra', () => {
    expect(validatePassword('Senha@Forte1')).toBeNull();
  });

  it('recusa senha fraca', () => {
    expect(validatePassword('fraca')).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it('recusa mais de 72 bytes (limite do BCrypt), contando acentos como 2 bytes', () => {
    expect(validatePassword('Senha@Forte1' + 'a'.repeat(61))).toBe(PASSWORD_MAX_BYTES_MESSAGE);
    expect(validatePassword('Sé@' + 'é'.repeat(37))).toBe(PASSWORD_MAX_BYTES_MESSAGE);
    expect(validatePassword('Senha@Forte1' + 'a'.repeat(60))).toBeNull();
  });

  it('não remove espaços das pontas', () => {
    expect(validatePassword('  Senha@Forte1  ')).toBeNull();
  });
});
