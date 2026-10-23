# Psiconet Frontend — Guia para agentes e desenvolvedores

> Fonte oficial de verdade do frontend. Projeto irmão: **Psiconet-Backend** (Spring Boot) —
> `../Psiconet-Backend/CLAUDE.md` (contrato de API, regras de negócio, ADRs 000–010 em `docs/decisoes/`).
> ADRs do frontend: `docs/decisoes/` (001 gráficos/Recharts, 002 editor/TipTap, 003 videochamada/LiveKit).

## Produto
Plataforma que conecta **pacientes** e **psicólogos** (busca, conexões, agenda, cobranças, notificações,
prontuário com anotações de sessão, suporte) e uma **área administrativa** (usuários, administradores,
dashboard, chamados, comunicados). Este projeto é o cliente web; o backend é a autoridade de tudo.

## Stack
Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript 5 · Tailwind 4 · Jest 30 + Testing Library ·
react-hot-toast · nextjs-toploader · **Recharts 3** (dashboard admin) · **TipTap 3** (editor de anotações) · lucide-react ·
**livekit-client 2.22 + @livekit/components-react 2.9** (Sala Psiconet, carregados só em `/call`).

## Comandos
```bash
npm ci              # instala dependências
npm run dev         # http://localhost:3000 (backend em NEXT_PUBLIC_API_URL, padrão :8080)
npm run build       # build de produção (inclui checagem de tipos)
npm test            # Jest + Testing Library (90+ testes)
npm run lint        # ESLint 9 + eslint-config-next (ESLint 10 ainda não é suportado pelos plugins)
npx tsc --noEmit    # checagem de tipos isolada
```
Variáveis (`.env.example`): `NEXT_PUBLIC_API_URL` (embutida no build; também entra na CSP), `COOKIE_TOKEN_NAME`,
`ROLE_PREFIX`, `VIDEO_CSP_ORIGINS` (origens do provedor de vídeo liberadas em `connect-src`; lida no build/start). **Não há durações de sessão no front**: os cookies seguem as expirações devolvidas pela API (ADR 014 do backend).
Lint: existem ~18 erros **pré-existentes** (principalmente `react-hooks/set-state-in-effect` em hooks antigos);
código novo deve sair sem erros.

## Estrutura (`src/`)
```
actions/        Server Actions (todas via apiClient): auth, register, logout, admin, tickets, medicalRecords,
                notifications, appointments, connections, payments, profile, recurrenceRules, treatmentLinks
app/
  (pages)/(auth)/        login (banner pós-cadastro + e-mail pré-preenchido), register, reset-password
  (pages)/change-password/   troca de senha (obrigatória p/ senha temporária: ?obrigatoria=1)
  (pages)/support/           Meus chamados: lista, /new, /[id] (paciente e psicólogo)
  (pages)/notifications/     central de notificações (todas as roles)
  (pages)/call/[appointmentId]/  Sala Psiconet (psicólogo e paciente; autorização no backend)
  (pages)/terms|privacy|cookies/  documentos legais públicos (logado e deslogado), renderizados do Markdown da API
  (pages)/accept-terms/      reaceite obrigatório de Termos/Privacidade (qualquer role autenticada)
  (pages)/admin/             layout com guarda de role; dashboard (Recharts + loading.tsx), users, tickets, tickets/[id]
  (pages)/psychologist/      ... + medical-records (lista + ?aba=solicitacoes), medical-records/[linkId]
  (pages)/patient/           ... + medical-records (solicitar), medical-records/[requestId] (somente leitura)
  api/payments/[id]/receipt, api/medical-records/[requestId]/pdf   proxies de arquivos (injetam o Bearer)
components/     Atomic Design
  Atoms/        badges (UserStatus/Role, TicketBadges), RichTextViewer (JSON → React, sem HTML), LegalMarkdown,
                ConsentGate, CookiePreferencesButton, PrintButton, UserAvatar
  Molecules/    ModalShell (dialog acessível), EditUser/CreateAdmin/NotifyUser/Addendum modais, RichTextEditor, Pagination,
                LegalConsentFields (checkboxes de aceite do cadastro e do reaceite)
  Organism/     Header (menu do usuário com Suporte acima de Sair), UsersTable, AdminDashboardCharts, TicketList,
                TicketConversation, NewTicketForm, MedicalRecordWorkspace, SessionNoteEditor, SessionNoteCard,
                AccessRequestsPanel, PatientRecordLinks, Footer (global), CookieBanner (+ modal de preferências),
                LegalDocumentView, PrivacyConsentsSection (configurações), ...
  templates/    FormLogin, FormRegister, FormResetPassword, FormChangePassword, AcceptTermsForm
contexts/       ConnectionContext, CookieConsentContext (useCookieConsent)
config/         routes.ts (ROUTES), navigation.tsx (NAV_ITEMS por role)
lib/            jwt (decodifica + expiração; só para navegação), password (espelho da política), notificationRoutes,
                datetime, cpf, calendar, currency, recurrence, sessionCookies + sessionRefresh (sessão, ADR 014),
                cookieConsent (categorias e cookie de consentimento), markdown (parser seguro), age
services/       api/apiClient.ts, cookieService.ts, legalService.ts (documentos/versões públicos, cache 5 min)
types/          admin, auth, ticket, medicalRecord, notification, appointment, payment, connection, profile, recurrence
proxy.ts        guarda de rotas por role (Next 16 "proxy", antigo middleware)
```

## Contrato com o backend
- Toda chamada sai do **servidor** (Server Actions → `apiClient`). **Sessão (ADR 014 do backend):** token de acesso de
  15 min em `psiconet_token` + refresh rotativo em `psiconet_refresh`, ambos httpOnly. Sem "Manter conectado neste
  dispositivo" são cookies de sessão do navegador; com a opção, persistentes com as expirações da API
  (`lib/sessionCookies.ts`). O **`proxy.ts` renova de forma transparente** (acesso ausente/vencendo em < 60 s + refresh
  presente → `POST /auth/refresh`, grava os cookies na resposta e repassa o token novo à própria requisição).
- `apiClient` retorna `{ data, error, status, code, fieldErrors, retryAfter }`:
  - corpo de sucesso vazio ou não-JSON não quebra (o texto puro do backend gerava o bug "conta já existe");
  - `fieldErrors` = `ErrorResponse.errors` → exibir no campo; `error` → toast;
  - **429** (`code: RATE_LIMITED`) → mensagem amigável com o tempo de espera (o backend envia `Retry-After`);
  - **401** em rota autenticada → `/login?sessao=expirada` (o proxy apaga os cookies e o login mostra o aviso);
  - **403 `PASSWORD_CHANGE_REQUIRED`** → `/change-password?obrigatoria=1`; **403 `CONSENT_REQUIRED`** → `/accept-terms`;
  - nenhum desses redirecionamentos acontece em chamadas `background: true` (polling do sino, navbar no layout);
  - repassa o IP do navegador em `X-Forwarded-For` e o navegador em `X-Client-User-Agent` (rate limit, prova de aceite).
- "Sair" chama `POST /auth/logout` (encerra só este dispositivo); "Sair de todos os dispositivos" (Configurações) chama
  `POST /auth/logout-all`.
- **O backend é a autoridade** de permissão, validação e limites; o front só reflete (esconde botões, redireciona).

## Roles e rotas
| Role | Base | Observações |
|---|---|---|
| Administrador | `/admin/*` | mesma tela de login; guarda no `proxy.ts` **e** em `admin/layout.tsx` |
| Psicólogo | `/psychologist/*` | + `/support`, `/notifications`, `/change-password` |
| Paciente | `/patient/*` | + `/support`, `/notifications`, `/change-password` |
`proxy.ts`: sessão perdida → apaga os cookies e vai para `/login?sessao=expirada`; `/terms`, `/privacy`, `/cookies`
abrem para todos (logado ou não, sem redirecionar ao dashboard); `/accept-terms` e `/api/*` para qualquer role logada;
`/support` só paciente/psicólogo (admin vai para `/admin/tickets`); `/call/*` só paciente/psicólogo (admin → dashboard);
perfis públicos cruzados liberados.

## Legal e Privacidade (ADRs 011–015 do backend)
- **Fonte única** dos documentos: `docs/legal/*.md` do backend, servidos em `GET /legal/documents/{slug}` e renderizados
  por `LegalMarkdown` (sem HTML bruto). Versões em `GET /legal/versions` — nunca fixe versão no front.
- **Cookies:** só estritamente necessários (`psiconet_token`, `psiconet_refresh`, `psiconet_consent`). Banner com
  Rejeitar/Personalizar/Aceitar de **mesmo destaque**; escolha gravada por Server Action (`actions/cookieConsent.ts`)
  com a versão da política; versão nova ⇒ banner reaparece. Reabrir pelo rodapé ou nas Configurações.
- **Qualquer script, pixel, fonte ou embed de terceiro** só entra com: categoria disponível em `lib/cookieConsent.ts`,
  `<ConsentGate>`/`useCookieConsent().hasConsent`, nova versão da Política de Cookies e origem liberada na CSP
  (`next.config.ts`). Hoje não há nenhum — mantenha assim sem decisão registrada.
- **Cadastro:** checkbox obrigatório de Termos + Privacidade (links em nova aba) e, para paciente, consentimento destacado
  de dados de saúde; versões enviadas em campos ocultos; 18+ validado (backend é a autoridade).
- **Reaceite:** `/accept-terms` (o login já manda para lá se `consentRequired`). **Configurações → Privacidade e
  consentimentos**: histórico de aceites, cookies, direitos do titular (chamado `PRIVACY`) e sair de todos os dispositivos.
- Cabeçalhos de segurança (CSP, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS em produção) em `next.config.ts`.

## Área administrativa
- **Usuários** (`/admin/users`): busca/filtros/ordenação na query string, aplicados **no servidor**; colunas nome,
  perfil, criado em, situação, CPF (já mascarado pelo backend); ações editar (nome/telefone/e-mail — papel nunca muda),
  notificar (comunicado = notificação + e-mail), ativar/inativar (admin base sem botão). "Novo administrador" cria
  conta nova com senha temporária (troca obrigatória; senha não vai por e-mail).
- **Dashboard** (`/admin/dashboard`): KPIs + 3 gráficos Recharts (ativos por perfil, totais, chamados abertos ×
  resolvidos) com valores escritos, tabela equivalente e estados de carregamento/vazio/erro (ADR 001 do front).
- **Chamados** (`/admin/tickets`): filtros por situação/prioridade/categoria/busca; detalhe com resposta, situação e
  prioridade. Resposta/finalização notifica o usuário (backend).

## Suporte (chamados)
Menu do usuário (foto no `Header`): **"Suporte · Meus chamados" acima de "Sair da Conta"** (desktop e mobile), só para
paciente/psicólogo. Telas: `/support` (lista + filtro), `/support/new`, `/support/[id]` (conversa, encerrar). Limites
espelhados em `TICKET_LIMITS`; o backend impõe (3 abertos, intervalo, duplicidade, tamanho).

## Prontuário e anotações (ADRs 008–010 do backend, 002 do front)
- Psicólogo: `/psychologist/medical-records` (pacientes + solicitações) e `/[linkId]` (anotações, registro documental,
  auditoria). Editor TipTap com barra enxuta, atalhos e **autosave do rascunho no servidor** (debounce 1,5 s); finalizar
  torna imutável (hash + nome/CRP); correções por adendo. Tipos: Registro documental × Anotação pessoal.
  Barra do editor: título/subtítulo/texto, negrito/itálico/sublinhado, alinhamento (esquerda/centro/direita),
  tamanho da fonte (lista fixa `FONT_SIZE_OPTIONS`), listas, desfazer/refazer. "Exportar PDF" no cabeçalho do
  prontuário (`RecordPdfExport` → `/api/medical-records/links/[linkId]/pdf`), com opção "Incluir anotações pessoais".
- Paciente: `/patient/medical-records` — solicita acesso, vê situação/justificativa; `/[requestId]` somente leitura e PDF.
- Conteúdo é JSON do editor; renderize **sempre** com `RichTextViewer` (nunca `dangerouslySetInnerHTML`).
- Nada clínico em `localStorage`/`sessionStorage`/URL; páginas clínicas não devem ser cacheadas.

## Videochamada — Sala Psiconet (ADR 016 do backend, ADR 003 do front, `docs/videochamada/`)
- **Agendamento:** `MeetingProviderSelector` no `CreateAppointmentModal` (único e recorrente) — "Sala Psiconet" é o padrão
  quando `getVideoConfigAction()` diz `enabled`; senão só "Link externo". Envia `meetingProvider`; link validado por
  `lib/meetingLink.ts` (mesma regra do backend).
- **Entrar:** sempre via `JoinCallButton` (cards, detalhes, agenda do paciente, dashboards). Sala Psiconet: habilitado só na
  janela `joinOpensAt`/`joinClosesAt` **do servidor** (`lib/videoCall.ts`). Link externo: `toSafeExternalUrl` + `rel="noopener noreferrer"`
  — nunca monte `href` de link externo à mão.
- **Página `/call/[appointmentId]`:** lobby → sala → fim (`components/Organism/VideoCall/`). SDK por `next/dynamic` (`CallLoader`).
  Credencial por `joinVideoCallAction` (Server Action) — token **só em memória**. Reconexão: SDK + até 3 reentradas automáticas.
- **Sozinho na sala:** limite `aloneTimeoutSeconds` da credencial (15 min) — aviso nos 2 últimos minutos e
  desconexão ("Você foi desconectado"); o backend também remove (`PARTICIPANT_REMOVED`). Permissão de câmera/
  microfone negada ⇒ `MediaPermissionHelp` (pedido do navegador ou passos de desbloqueio).
- **Cabeçalhos:** `camera`/`microphone` = `self` só em `/call/*`; origens do provedor só via `VIDEO_CSP_ORIGINS`.
- **Desligar:** flag no backend (`VIDEO_ENABLED=false`) — a opção some sozinha; nada a mudar no front.
- **Não fazemos:** gravação, chat, compartilhamento de tela; não usar prefabs do LiveKit (`PreJoin` grava em `localStorage`).

## Notificações
- `NotificationType` espelha o enum do backend, incluindo `VIDEO_SESSION_REMINDER`/`VIDEO_PARTICIPANT_JOINED` (clique ⇒ `/call/{id}`), `TICKET_REPLIED`, `TICKET_CLOSED`, `ADMIN_ANNOUNCEMENT`,
  `MEDICAL_RECORD_ACCESS_REQUESTED|GRANTED|DENIED` (obrigatórias, exibidas como "Sempre ativa" nas preferências).
- Destino do clique centralizado em `lib/notificationRoutes.ts` (`referenceType` + `referenceId` + role).
- Polling do contador a cada 15 s; "marcar todas" usa `PATCH /notifications/read-all`.

## Sistema de Conexões

Sistema social onde Pacientes e Psicólogos se conectam:
- Listagem otimista: Uso de `ConnectionContext` para reagir em real-time a mudanças de status (Conectar, Remover, etc) sem reload.
- `useConnectionActions`: Hook encapsulador que abstrai as chamadas HTTP e controla toasts/loading.
- As Server Actions de perfis rodam em paralelo para buscar os dados de perfil + checar o estado de conexão com o remetente atual (via Promise.all).
- Cada conexão ativa carrega um `TreatmentLink` (`treatmentLinkId` + `defaultPrice` em `ConnectedUserDTO`). O psicólogo edita o preço padrão do vínculo direto no `ConnectionCard` (botão "Editar Preço" → `EditTreatmentPriceModal` → `updateTreatmentLinkPriceAction`), e esse valor pré-preenche o campo de preço ao criar um novo agendamento.

---

## Sistema de Agendamento e Recorrência

- `useAppointments` (hook client) concentra todo o estado da agenda: filtros, modais (criar/cancelar/detalhes) e as chamadas às Server Actions de `actions/appointments.ts`.
- `PsychologistAgendaView` / `PatientAgendaView` (Organism) renderizam o calendário (`CalendarGrid`) e a lista de consultas por perspectiva (`psychologist` | `patient`).
- **Consultas recorrentes**: no `CreateAppointmentModal`, o toggle "Consulta recorrente" troca os campos de data única pelos campos de `RecurrenceRuleCreateDTO` (frequência, dia da semana quando aplicável, datas de início/fim, `adjustForWeekend`) e chama `createRecurrenceRuleAction` (`actions/recurrenceRules.ts`) em vez de `createAppointmentAction`. O backend gera as instâncias de `Appointment` a partir da regra.
- Um `AppointmentDTO` gerado por recorrência carrega `recurrenceRuleId`; o `AppointmentDetailsModal` exibe um indicador de "série recorrente" quando presente.
- **Cancelamento com escopo**: quando a consulta pertence a uma série **e** quem cancela é o psicólogo, o `CancelAppointmentModal` exibe um seletor de escopo (`AppointmentCancelScope`: `SINGLE` | `THIS_AND_FOLLOWING` | `ALL_SERIES`). Para o paciente o fluxo permanece single-consulta com motivo obrigatório.

---

## Sistema de Cobranças (Payments)

- `PaymentDTO` (backend) só carrega `appointmentId` — não traz dados de paciente/psicólogo/data da sessão embutidos. O `PaymentsView` (Organism) busca os agendamentos do usuário em paralelo (`getMyAppointmentsAction`) e cruza por id para exibir contexto (data, outra parte) junto de cada cobrança.
- Fluxo de status: `PENDING → AWAITING_REVIEW (paciente envia comprovante) → APPROVED | REJECTED (psicólogo revisa) → DISPUTED (paciente contesta rejeição) → CANCELLED`.
- Upload de comprovante é sempre via `apiClient.postForm` com `FormData` nativo (nunca base64) — `UploadReceiptModal` → `uploadPaymentReceiptAction`.
- `RejectPaymentModal` (motivo obrigatório) e `DisputePaymentModal` (mensagem obrigatória) seguem o mesmo padrão dos modais de cancelamento: validação local + `useMyPayments` cuidando de toasts e estado otimista.
- Configurações de cobrança do psicólogo (chave Pix, `paymentTiming`, `paymentAdvanceMinutes`) ficam em `/psychologist/settings` (`BillingSettingsForm` → `updateBillingSettingsAction`). **Atenção:** `GET /psychologists/me` ainda não retorna esses campos, então o formulário não pré-preenche os valores já salvos — só define novos.

---

## Convenções
- Server-first: `use client` só nas folhas interativas. Tipagem estrita (sem `any` em dados de negócio; tipos em `src/types`).
- Formulários com `FormData`/estado local; erros por campo com `role="alert"` e `aria-invalid`; botões travados durante envio
  e até a navegação terminar.
- Modais via `ModalShell` (Esc fecha, `role="dialog"`, foco). Ações sempre visíveis (não só no hover). Textos em pt-BR.
- Commits semânticos em português; testes para regras de UI críticas (menu, tabela admin, viewer, apiClient).

## Nunca faça
- Guardar token de vídeo fora da memória, gravar a sessão ou carregar o SDK de vídeo fora de `/call`.
- Chamar a API direto do navegador com o token ou guardar token/dado clínico em `localStorage`/`sessionStorage`.
- Carregar script/cookie não essencial ou recurso de terceiro sem consentimento e sem atualizar a Política de Cookies.
- Criar duração de sessão no front (as durações são do backend) ou pré-marcar checkbox de aceite.
- Versionar `.env*` (exceto `.env.example`).
- Exibir CPF completo, conteúdo clínico fora das telas do psicólogo titular/paciente liberado, ou renderizar HTML vindo de usuário.
- Inventar valores de enum (status, notificação, role) que não existam no backend; confiar em `decodeRoleFromToken` para
  segurança (é só navegação).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
