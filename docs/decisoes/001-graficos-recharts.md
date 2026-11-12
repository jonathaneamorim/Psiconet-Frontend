# ADR 001 (frontend) — Biblioteca de gráficos do dashboard administrativo

- **Status:** aceito
- **Data:** 2026-10-01
- Contexto geral das decisões: ver `../Psiconet-Backend/docs/decisoes/` (ADR 006 — área administrativa).

## Decisão
**Recharts 3** para os gráficos de `/admin/dashboard`.

- Compatível oficialmente com React 19 (`peerDependencies` até `^19`) e com Next 16 em client component.
- Componentes declarativos em SVG (fácil de estilizar com a paleta e rótulos em pt-BR), tooltip
  embutido, `ResponsiveContainer` para mobile, sem dependência de canvas.
- Alternativas: Chart.js (canvas — pior para acessibilidade e impressão), Nivo (mais pesado),
  Visx (baixo nível, mais código para três gráficos simples).

## Acessibilidade e leitura
- Barras horizontais com **valor escrito** em cada barra e rótulo no eixo (identidade nunca depende
  só de cor); cada gráfico tem **tabela equivalente** visível; estados de carregamento (`loading.tsx`),
  vazio ("Ainda não há dados") e erro.
- Paleta validada com o script da skill de dataviz (azul `#2a78d6`, laranja `#eb6834`: separação
  CVD e normal-vision dentro dos limites no tema claro).
- Os números vêm agregados do backend (`GET /admin/dashboard`) — nenhum dado pessoal no navegador.
