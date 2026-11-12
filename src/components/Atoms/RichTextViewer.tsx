import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { FONT_SIZES, type RichTextDoc, type RichTextNode } from '@/types/medicalRecord';

/*
 * Renderiza o JSON do editor como elementos React (texto sempre escapado pelo React).
 * Não usa dangerouslySetInnerHTML; nós fora da whitelist são ignorados.
 */
function renderText(node: RichTextNode, key: number): ReactNode {
  let el: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') el = <strong>{el}</strong>;
    else if (mark.type === 'italic') el = <em>{el}</em>;
    else if (mark.type === 'underline') el = <u>{el}</u>;
    else if (mark.type === 'textStyle') {
      // Só valores da lista fixa viram estilo (o backend já garante; aqui é defesa extra)
      const size = mark.attrs?.fontSize;
      if (size && (FONT_SIZES as readonly string[]).includes(size)) el = <span style={{ fontSize: size }}>{el}</span>;
    }
  }
  return <Fragment key={key}>{el}</Fragment>;
}

function alignStyle(node: RichTextNode): CSSProperties | undefined {
  const align = node.attrs?.textAlign;
  return align === 'center' || align === 'right' ? { textAlign: align } : undefined;
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  const children = (node.content ?? []).map((child, i) => renderNode(child, i));
  switch (node.type) {
    case 'text':
      return renderText(node, key);
    case 'hardBreak':
      return <br key={key} />;
    case 'paragraph':
      return <p key={key} style={alignStyle(node)}>{children}</p>;
    case 'heading':
      return node.attrs?.level === 2
        ? <h4 key={key} style={alignStyle(node)}>{children}</h4>
        : <h3 key={key} style={alignStyle(node)}>{children}</h3>;
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key} start={node.attrs?.start}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    default:
      return null;
  }
}

export function RichTextViewer({ doc, className = '' }: { doc: RichTextDoc | null; className?: string }) {
  if (!doc?.content?.length) return <p className="text-sm text-slate-500">—</p>;
  return <div className={`psiconet-prose ${className}`}>{doc.content.map((n, i) => renderNode(n, i))}</div>;
}
