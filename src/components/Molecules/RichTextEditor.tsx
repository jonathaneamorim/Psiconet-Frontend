'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { FONT_SIZE_OPTIONS, type RichTextDoc, type TextAlign as Align } from '@/types/medicalRecord';

interface Props {
  value: RichTextDoc;
  onChange?: (doc: RichTextDoc) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  ariaLabel: string;
  placeholder?: string;
  minHeightClass?: string;
}

/*
 * Somente os nós/marcas aceitos pela whitelist do backend (RichTextSanitizer): título (H1),
 * subtítulo (H2), parágrafo, negrito, itálico, sublinhado, listas, desfazer/refazer, alinhamento
 * (esquerda/centro/direita) e tamanho de fonte (lista fixa FONT_SIZES).
 * Conteúdo colado fora disso é normalizado pelo próprio schema (extensões desativadas não existem).
 */
const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2] },
    blockquote: false,
    codeBlock: false,
    code: false,
    strike: false,
    horizontalRule: false,
    link: false,
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right'] }),
  TextStyle,
  FontSize,
];

const ALIGN_BUTTONS: { value: Align; label: string; shortcut: string; path: string }[] = [
  { value: 'left', label: 'Alinhar à esquerda', shortcut: 'Ctrl+Shift+L', path: 'M4 6h16M4 10h10M4 14h16M4 18h10' },
  { value: 'center', label: 'Centralizar', shortcut: 'Ctrl+Shift+E', path: 'M4 6h16M7 10h10M4 14h16M7 18h10' },
  { value: 'right', label: 'Alinhar à direita', shortcut: 'Ctrl+Shift+R', path: 'M4 6h16M10 10h10M4 14h16M10 18h10' },
];

interface ToolButtonProps {
  label: string;
  shortcut: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({ label, shortcut, active, disabled, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label} (${shortcut})`}
      title={`${label} (${shortcut})`}
      aria-pressed={active === undefined ? undefined : active}
      className={`min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-30 ${
        active ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      paragraph: e.isActive('paragraph'),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      align: (['center', 'right'] as const).find((a) => e.isActive({ textAlign: a })) ?? 'left',
      fontSize: (e.getAttributes('textStyle').fontSize as string | undefined) ?? '',
    }),
  });

  const chain = () => editor.chain().focus();
  const divider = <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden="true" />;

  return (
    <div role="toolbar" aria-label="Formatação" className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
      <ToolButton label="Título" shortcut="Ctrl+Alt+1" active={state.h1} onClick={() => chain().toggleHeading({ level: 1 }).run()}>
        <span className="font-bold">T</span>
      </ToolButton>
      <ToolButton label="Subtítulo" shortcut="Ctrl+Alt+2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <span className="font-semibold text-xs">ST</span>
      </ToolButton>
      <ToolButton label="Texto" shortcut="Ctrl+Alt+0" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
        <span className="text-xs">¶</span>
      </ToolButton>
      {divider}
      <ToolButton label="Negrito" shortcut="Ctrl+B" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <span className="font-bold">N</span>
      </ToolButton>
      <ToolButton label="Itálico" shortcut="Ctrl+I" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <span className="italic font-serif">I</span>
      </ToolButton>
      <ToolButton label="Sublinhado" shortcut="Ctrl+U" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <span className="underline">S</span>
      </ToolButton>
      {divider}
 {ALIGN_BUTTONS.map((a) => (
        <ToolButton key={a.value} label={a.label} shortcut={a.shortcut} active={state.align === a.value}
          onClick={() => chain().setTextAlign(a.value).run()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeWidth={2} d={a.path} />
          </svg>
        </ToolButton>
      ))}
      {divider}
      <label className="inline-flex items-center">
        <span className="sr-only">Tamanho da fonte</span>
        <select
          value={state.fontSize}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const size = e.target.value;
            if (size) chain().setFontSize(size).run();
            else chain().unsetFontSize().run();
          }}
          title="Tamanho da fonte"
          className="h-9 px-2 text-xs text-slate-700 bg-transparent border border-transparent hover:border-slate-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          {FONT_SIZE_OPTIONS.map((o) => <option key={o.value || 'normal'} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      {divider}
      <ToolButton label="Lista com marcadores" shortcut="Ctrl+Shift+8" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></svg>
      </ToolButton>
      <ToolButton label="Lista numerada" shortcut="Ctrl+Shift+7" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeWidth={2} d="M10 6h10M10 12h10M10 18h10M4 5h1v3M4 11.5h2L4 14h2M4 17h2v3H4" /></svg>
      </ToolButton>
      {divider}
      <ToolButton label="Desfazer" shortcut="Ctrl+Z" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" /></svg>
      </ToolButton>
      <ToolButton label="Refazer" shortcut="Ctrl+Shift+Z" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" /></svg>
      </ToolButton>
    </div>
  );
}

/** Editor de texto rico enxuto para anotações clínicas (foco em escrita, responsivo, acessível). */
export function RichTextEditor({ value, onChange, onBlur, readOnly = false, ariaLabel, placeholder, minHeightClass = 'min-h-64' }: Props) {
  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    // Next/SSR: renderiza só no cliente para evitar divergência de hidratação
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `psiconet-prose ${minHeightClass} px-4 py-3 focus:outline-none`,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChange?.(e.getJSON() as RichTextDoc),
    onBlur: () => onBlur?.(),
  });

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  if (!editor) {
    return <div className={`${minHeightClass} rounded-xl border border-slate-200 bg-slate-50 animate-pulse`} aria-hidden="true" />;
  }

  return (
    <div className={`rounded-xl border ${readOnly ? 'border-slate-100' : 'border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'} bg-white`}>
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
