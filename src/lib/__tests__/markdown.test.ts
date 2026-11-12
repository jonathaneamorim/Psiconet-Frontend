import { isSafeHref, parseInline, parseMarkdown, slugify, tableOfContents } from '@/lib/markdown';

describe('markdown dos documentos legais', () => {
  it('gera ids estáveis e sem acento para os títulos (âncoras do sumário)', () => {
    expect(slugify('9. Seus direitos (LGPD, art. 18)')).toBe('9-seus-direitos-lgpd-art-18');
    const blocks = parseMarkdown('## Introdução\n\ntexto\n\n## Introdução\n\n### Sub');
    expect(tableOfContents(blocks)).toEqual([
      { id: 'introducao', text: 'Introdução' },
      { id: 'introducao-2', text: 'Introdução' },
    ]);
  });

  it('reconhece tabela, listas, citação e parágrafo', () => {
    const md = [
      '> **Minuta** técnica',
      '',
      '| Nome | Duração |',
      '|---|---|',
      '| `psiconet_token` | 15 min |',
      '',
      '- um',
      '- dois',
      '',
      '1. primeiro',
      '2. segundo',
      '',
      'Parágrafo em',
      'duas linhas.',
    ].join('\n');
    const types = parseMarkdown(md).map((b) => b.type);
    expect(types).toEqual(['quote', 'table', 'list', 'list', 'paragraph']);
    const table = parseMarkdown(md)[1];
    expect(table.type === 'table' && table.rows[0][0]).toEqual([{ type: 'code', value: 'psiconet_token' }]);
  });

  it('nunca gera link com esquema perigoso', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('//evil.com')).toBe(false);
    expect(isSafeHref('/privacy')).toBe(true);
    expect(isSafeHref('https://cvv.org.br')).toBe(true);
    expect(parseInline('[clique](javascript:void0)')).toEqual([{ type: 'text', value: 'clique' }]);
  });

  it('negrito, itálico e links internos', () => {
    expect(parseInline('Veja **a** [Política](/privacy) e *isto*')).toEqual([
      { type: 'text', value: 'Veja ' },
      { type: 'strong', children: [{ type: 'text', value: 'a' }] },
      { type: 'text', value: ' ' },
      { type: 'link', href: '/privacy', children: [{ type: 'text', value: 'Política' }] },
      { type: 'text', value: ' e ' },
      { type: 'em', children: [{ type: 'text', value: 'isto' }] },
    ]);
  });
});
