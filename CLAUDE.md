# Psiconet Frontend — Guia para agentes e desenvolvedores

> Fonte oficial de verdade do frontend. Projeto irmão: **Psiconet-Backend** (Spring Boot) —
> `../Psiconet-Backend/CLAUDE.md` (contrato de API, regras de negócio, ADRs 000–010 em `docs/decisoes/`).
> ADRs do frontend: `docs/decisoes/` (001 gráficos/Recharts, 002 editor/TipTap).

## Produto
Plataforma que conecta **pacientes** e **psicólogos** (busca, conexões, agenda, cobranças, notificações,
prontuário com anotações de sessão, suporte) e uma **área administrativa** (usuários, administradores,
dashboard, chamados, comunicados). Este projeto é o cliente web; o backend é a autoridade de tudo.

## Stack
Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript 5 · Tailwind 4 · Jest 30 + Testing Library ·
react-hot-toast · nextjs-toploader · **Recharts 3** (dashboard admin) · **TipTap 3** (editor de anotações) · lucide-react.

## Comandos
```bash
npm ci              # instala dependências
npm run dev         # http://localhost:3000 (backend em NEXT_PUBLIC_API_URL, padrão :8080)
npm run build       # build de produção (inclui checagem de tipos)
npm test            # Jest + Testing Library (52+ testes)
npm run lint        # ESLint 9 + eslint-config-next (ESLint 10 ainda não é suportado pelos plugins)
npx tsc --noEmit    # checagem de tipos isolada
```
Variáveis (`.env.example`): `NEXT_PUBLIC_API_URL` (embutida no build), `ACCESS_TIME` (min, fallback do cookie),
`KEEP_LOGGED_TIME` (dias, fallback), `COOKIE_TOKEN_NAME`, `ROLE_PREFIX`.
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
  (pages)/admin/             layout com guarda de role; dashboard (Recharts + loading.tsx), users, tickets, tickets/[id]
  (pages)/psychologist/      ... + medical-records (lista + ?aba=solicitacoes), medical-records/[linkId]
  (pages)/patient/           ... + medical-records (solicitar), medical-records/[requestId] (somente leitura)
  api/payments/[id]/receipt, api/medical-records/[requestId]/pdf   proxies de arquivos (injetam o Bearer)
components/     Atomic Design
  Atoms/        badges (UserStatus/Role, TicketBadges), RichTextViewer (JSON → React, sem HTML)
  Molecules/    ModalShell (dialog acessível), EditUser/CreateAdmin/NotifyUser/Addendum modais, RichTextEditor, Pagination
  Organism/     Header (menu do usuário com Suporte acima de Sair), UsersTable, AdminDashboardCharts, TicketList,
                TicketConversation, NewTicketForm, MedicalRecordWorkspace, SessionNoteEditor, SessionNoteCard,
                AccessRequestsPanel, PatientRecordLinks, ...
  templates/    FormLogin, FormRegister, FormResetPassword, FormChangePassword
config/         routes.ts (ROUTES), navigation.tsx (NAV_ITEMS por role)
lib/            jwt (decodifica + expiração; só para navegação), password (espelho da política), notificationRoutes,
                datetime, cpf, calendar, currency, recurrence
services/       api/apiClient.ts, cookieService.ts
types/          admin, auth, ticket, medicalRecord, notification, appointment, payment, connection, profile, recurrence
proxy.ts        guarda de rotas por role (Next 16 "proxy", antigo middleware)
```

## Contrato com o backend
- Toda chamada sai do **servidor** (Server Actions → `apiClient`). Token JWT em cookie httpOnly; o cookie expira junto
  com o token (`expiresAt` do login). "Manter login" pede token longo ao backend (`rememberMe`).
- `apiClient` retorna `{ data, error, status, code, fieldErrors, retryAfter }`:
  - corpo de sucesso vazio ou não-JSON não quebra (o texto puro do backend gerava o bug "conta já existe");
  - `fieldErrors` = `ErrorResponse.errors` → exibir no campo; `error` → toast;
  - **429** (`code: RATE_LIMITED`) → mensagem amigável com o tempo de espera (o backend envia `Retry-After`);
  - **401** em rota autenticada → limpa o cookie (sessão invalidada no backend);
  - **403 `PASSWORD_CHANGE_REQUIRED`** → redireciona para `/change-password?obrigatoria=1`
    (exceto chamadas com `skipPasswordRedirect`, como o polling do sino);
  - repassa o IP do navegador em `X-Forwarded-For` (o rate limit por IP do backend depende disso).
- Logout chama `POST /auth/logout` (invalida todos os tokens do usuário) antes de apagar o cookie.
- **O backend é a autoridade** de permissão, validação e limites; o front só reflete (esconde botões, redireciona).

## Roles e rotas
| Role | Base | Observações |
|---|---|---|
| Administrador | `/admin/*` | mesma tela de login; guarda no `proxy.ts` **e** em `admin/layout.tsx` |
| Psicólogo | `/psychologist/*` | + `/support`, `/notifications`, `/change-password` |
| Paciente | `/patient/*` | + `/support`, `/notifications`, `/change-password` |
`proxy.ts`: token expirado/ inválido → apaga cookie e vai para `/login`; `/support` só paciente/psicólogo (admin vai
para `/admin/tickets`); perfis públicos cruzados (`/patient/profile/[id]`, `/psychologist/profile/[id]`) liberados.

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
- Paciente: `/patient/medical-records` — solicita acesso, vê situação/justificativa; `/[requestId]` somente leitura e PDF.
- Conteúdo é JSON do editor; renderize **sempre** com `RichTextViewer` (nunca `dangerouslySetInnerHTML`).
- Nada clínico em `localStorage`/`sessionStorage`/URL; páginas clínicas não devem ser cacheadas.

## Notificações
- `NotificationType` espelha o enum do backend, incluindo `TICKET_REPLIED`, `TICKET_CLOSED`, `ADMIN_ANNOUNCEMENT`,
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
- Chamar a API direto do navegador com o token ou guardar token/dado clínico em `localStorage`/`sessionStorage`.
- Versionar `.env*` (exceto `.env.example`).
- Exibir CPF completo, conteúdo clínico fora das telas do psicólogo titular/paciente liberado, ou renderizar HTML vindo de usuário.
- Inventar valores de enum (status, notificação, role) que não existam no backend; confiar em `decodeRoleFromToken` para
  segurança (é só navegação).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
