# ADR 002 (frontend) — Editor de anotações de sessão (TipTap)

- **Status:** aceito
- **Data:** 2026-10-01
- Decisão de armazenamento/integridade: `../Psiconet-Backend/docs/decisoes/010-editor-de-anotacoes.md`.

## Decisão
**TipTap 3** (`@tiptap/react`, `@tiptap/starter-kit`) sobre ProseMirror.
- Compatível com React 19 (peer até `^19`) e Next 16; `immediatelyRender: false` evita divergência de
  hidratação no App Router.
- Schema restrito via `StarterKit.configure` — só título/subtítulo/parágrafo, negrito/itálico/sublinhado,
  listas, desfazer/refazer. Extensões desativadas não existem no schema, então conteúdo colado com
  outras formatações é normalizado. O backend revalida por whitelist.
- Alternativas: Lexical (bom, mas JSON próprio e mais código para o mesmo resultado), Slate (API
  instável entre versões), Quill (orientado a HTML/Delta, pior para validação estrutural).

## UX e acessibilidade
- Barra de ferramentas `role="toolbar"` com `aria-pressed`, rótulos e atalhos (Ctrl+B/I/U, Ctrl+Alt+1/2/0,
  Ctrl+Shift+7/8, Ctrl+Z / Ctrl+Shift+Z); área editável com `role="textbox"` e `aria-label`.
- **Autosave do rascunho no servidor** (debounce de 1,5 s e ao sair do campo), com status em
  `aria-live`; aviso ao fechar a aba com alterações pendentes; conflito de versão (outra aba) detectado.
- **Nada clínico em `localStorage`/`sessionStorage`** — o rascunho só existe no servidor, cifrado.
- Visualização por `RichTextViewer`, que percorre o JSON e gera elementos React (sem `dangerouslySetInnerHTML`).
