import { normalizeCategories, parseConsent, serializeConsent } from '@/lib/cookieConsent';

describe('cookieConsent', () => {
  const consent = { version: '1.0.0', categories: ['necessary' as const], date: '2026-10-02T12:00:00.000Z' };

  it('lê de volta o que gravou', () => {
    expect(parseConsent(serializeConsent(consent), '1.0.0')).toEqual(consent);
  });

  it('versão diferente da política vigente ⇒ pergunta de novo', () => {
    expect(parseConsent(serializeConsent(consent), '1.1.0')).toBeNull();
  });

  it('cookie ausente, corrompido ou sem versão vigente ⇒ null', () => {
    expect(parseConsent(undefined, '1.0.0')).toBeNull();
    expect(parseConsent('{lixo', '1.0.0')).toBeNull();
    expect(parseConsent(serializeConsent(consent), null)).toBeNull();
  });

  it('necessários sempre presentes; categorias inexistentes ou indisponíveis são descartadas', () => {
    expect(normalizeCategories([])).toEqual(['necessary']);
    expect(normalizeCategories(['marketing', 'statistics', 'qualquer'])).toEqual(['necessary']);
  });
});
