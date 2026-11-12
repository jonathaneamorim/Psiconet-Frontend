import { isAtLeastAge } from '@/lib/age';

describe('isAtLeastAge', () => {
  const today = new Date(2026, 9, 2); // 02/10/2026
  it('completa 18 anos no próprio dia', () => {
    expect(isAtLeastAge('2008-10-02', 18, today)).toBe(true);
    expect(isAtLeastAge('2008-10-03', 18, today)).toBe(false);
  });
  it('data inválida não passa', () => {
    expect(isAtLeastAge('', 18, today)).toBe(false);
  });
});
