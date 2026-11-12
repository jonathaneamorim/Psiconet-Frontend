import { decodeRoleFromToken, isTokenExpired } from '@/lib/jwt';

function token(payload: object) {
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${enc({ alg: 'HS256' })}.${enc(payload)}.assinatura`;
}

describe('jwt', () => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  const past = Math.floor(Date.now() / 1000) - 10;

  it('extrai a role de um token válido', () => {
    expect(decodeRoleFromToken(token({ role: 'ADMIN', exp: future }))).toBe('admin');
  });

  it('considera expirado e não devolve role', () => {
    const t = token({ role: 'PATIENT', exp: past });
    expect(isTokenExpired(t)).toBe(true);
    expect(decodeRoleFromToken(t)).toBeNull();
  });

  it('rejeita role desconhecida e token malformado', () => {
    expect(decodeRoleFromToken(token({ role: 'SUPERUSER', exp: future }))).toBeNull();
    expect(decodeRoleFromToken('lixo')).toBeNull();
  });
});
