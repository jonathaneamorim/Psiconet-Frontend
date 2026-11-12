# ADR 003 (frontend) — Videochamada integrada com LiveKit

- **Status:** aceito
- **Data:** 2026-10-23
- Decisão principal (provedor, regras de acesso, custos, LGPD): `../Psiconet-Backend/docs/decisoes/016-videochamada-integrada.md`.

## Decisão
- **SDK:** `livekit-client` 2.22.4 + `@livekit/components-react` 2.9.24 (versões fixas; peer `react >=18`,
  validadas com React 19.2/Next 16). Usamos **só os hooks/componentes** (`LiveKitRoom`, `useTracks`,
  `VideoTrack`, `usePreviewTracks`, `useMediaDeviceSelect`, `useConnectionQualityIndicator`...) com UI
  própria em Tailwind — sem `@livekit/components-styles` e sem os prefabs (`VideoConference`, `PreJoin`),
  para manter o design system, os textos em pt-BR e evitar `localStorage` (o `PreJoin` persiste escolhas).
- **Carregamento dinâmico:** `CallLoader` faz `next/dynamic(..., { ssr: false })` de `CallExperience`; o SDK
  (~600 KB) vira um chunk referenciado **só** por `/call/[appointmentId]`.
- **Credencial:** `joinVideoCallAction` (Server Action → `apiClient` → `POST /appointments/{id}/video/join`).
  O token do provedor fica no estado React da página; nunca em storage, cookie ou URL. Cada nova entrada
  (inclusive reconexão após queda longa) pede credencial nova.
- **Rota compartilhada** `/call/[appointmentId]` (`ROUTES.CALL`): no `proxy.ts` liberada para psicólogo e
  paciente (admin → dashboard) e incluída no `matcher`. A participação na consulta é validada pelo backend.
- **Cabeçalhos:** `connect-src` recebe só as origens de `VIDEO_CSP_ORIGINS`; `media-src 'self' blob:`;
  `Permissions-Policy: camera=(self), microphone=(self)` **apenas** em `/call/*` (demais rotas seguem `()`).
- **Reconexão:** o SDK reconecta sozinho quedas curtas (faixa "Conexão instável — reconectando…"); se a sala
  desconectar por falha, a página pede nova credencial e reentra até 3 vezes seguidas antes de mostrar
  "Conexão perdida". `ROOM_DELETED` ⇒ "Sessão encerrada"; `DUPLICATE_IDENTITY` ⇒ "aberta em outro lugar".
- **Fora do escopo:** chat e compartilhamento de tela (o token nem permite). Prontuário: botão
  "Prontuário" (só psicólogo) abre o prontuário do vínculo em nova aba — ponto de extensão para um painel
  lateral com o editor de anotações.

## Alternativas
Prefabs do LiveKit (rápidos, mas visual/textos próprios e `localStorage`); Daily React (custo por minuto
8× maior); iframe do Jitsi (sem controle de UI/CSP mais permissiva).
