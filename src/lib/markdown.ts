/*
 * Parser mínimo de Markdown para os documentos legais (fonte: docs/legal do backend, ADR 011).
 * Gera uma árvore simples que é renderizada como elementos React — nunca HTML bruto
 * (sem dangerouslySetInnerHTML). Suporta só o que os documentos usam: títulos (##, ###),
 * parágrafos, listas, tabelas, citações (>), **negrito**, *itálico*, `código` e [links](url).
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; children: Inline[] };

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; id: string; text: string; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'table'; header: Inline[][]; rows: Inline[][][] }
  | { type: 'quote'; children: Block[] };

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Só links seguros: rotas internas, âncoras, http(s) e mailto. Qualquer outro esquema vira texto. */
export function isSafeHref(href: string): boolean {
  return /^(\/(?!\/)|#|https?:\/\/|mailto:)/i.test(href.trim());
}

const INLINE = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*]+)\*)/;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest.length > 0) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push({ type: 'text', value: rest });
      break;
    }
    if (m.index > 0) out.push({ type: 'text', value: rest.slice(0, m.index) });
    if (m[1]) out.push({ type: 'strong', children: parseInline(m[2]) });
    else if (m[3]) out.push({ type: 'code', value: m[4] });
    else if (m[5]) {
      const href = m[7];
      out.push(isSafeHref(href)
        ? { type: 'link', href, children: parseInline(m[6]) }
        : { type: 'text', value: m[6] });
    } else if (m[8]) out.push({ type: 'em', children: parseInline(m[9]) });
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

function splitRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

const isTableSeparator = (line: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line.trim());
const LIST_ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

export function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  const usedIds = new Map<string, number>();
  let i = 0;

  const uniqueId = (text: string) => {
    const base = slugify(text) || 'secao';
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(Math.max(heading[1].length, 2), 4) as 2 | 3 | 4;
      const text = heading[2].trim();
      blocks.push({ type: 'heading', level, id: uniqueId(text), text: text.replace(/[*`]/g, ''), children: parseInline(text) });
      i++;
      continue;
    }

    if (line.trim().startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line).map(parseInline);
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    if (line.trimStart().startsWith('>')) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quoted.push(lines[i].trimStart().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', children: parseMarkdown(quoted.join('\n')) });
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      const ordered = /\d+\./.test(item[2]);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const current = LIST_ITEM.exec(lines[i]);
        if (!current || /\d+\./.test(current[2]) !== ordered) break;
        let text = current[3];
        i++;
        // Continuação do item em linhas indentadas
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !LIST_ITEM.test(lines[i])) {
          text += ' ' + lines[i].trim();
          i++;
        }
        items.push(parseInline(text));
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4})\s/.test(lines[i])
      && !LIST_ITEM.test(lines[i]) && !lines[i].trimStart().startsWith('>') && !lines[i].trim().startsWith('|')) {
      paragraph.push(lines[i].trim());
      i++;
    }
    if (paragraph.length === 0) {
      // Linha que não se encaixa em nada (ex.: tabela sem separador): vira parágrafo sozinha.
      paragraph.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', children: parseInline(paragraph.join(' ')) });
  }

  return blocks;
}

/** Sumário: títulos de nível 2. */
export function tableOfContents(blocks: Block[]): { id: string; text: string }[] {
  return blocks.flatMap((b) => (b.type === 'heading' && b.level === 2 ? [{ id: b.id, text: b.text }] : []));
}
