# Psiconet — Contexto para IAs (Frontend + Backend)

> Este arquivo descreve a arquitetura, convenções e contexto completo do projeto Psiconet para que IAs (Claude, Gemini, GPT, etc.) possam entender o sistema rapidamente sem precisar explorar o código do zero.

---

## O que é o Psiconet

Psiconet é uma plataforma web de saúde mental que conecta **pacientes** a **psicólogos**. Possui um painel administrativo para gestão da plataforma. O **frontend** é um cliente web em **Next.js 16 (App Router)** que consome uma **API REST** construída em **Java/Spring Boot 3.3.5**.

---

## Stack Técnica

### Frontend

| Camada       | Tecnologia                                         |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 16 com App Router                          |
| Linguagem    | TypeScript                                         |
| Estilo       | CSS + Tailwind utility classes (globals.css)       |
| Fonte        | Raleway (Google Fonts)                             |
| Auth         | JWT armazenado em cookie httpOnly                  |
| API Client   | Fetch API nativa via `apiClient` centralizado      |
| Testes       | Jest + Testing Library                             |
| Toast        | react-hot-toast                                    |
| Progress Bar | nextjs-toploader                                   |

### Backend

| Camada         | Tecnologia                            |
| -------------- | ------------------------------------- |
| Linguagem      | Java 17                               |
| Framework      | Spring Boot 3.3.5                     |
| Segurança      | Spring Security + JWT (Stateless)     |
| Banco de dados | PostgreSQL                            |
| Persistência   | Spring Data JPA                       |
| Mapeamento     | MapStruct + Lombok                    |
| Documentação   | SpringDoc OpenAPI (Swagger)           |
| Validação      | Hibernate Validator (Bean Validation) |

---

## Estrutura de Diretórios (Frontend `src/`)

Para detalhes mais profundos, consulte a pasta `/docs` na raiz do projeto.

```
src/
├── actions/            # Server Actions do Next.js (Mutações e Buscas via apiClient)
│   ├── admin.ts
│   ├── appointments.ts # CRUD de agendamentos (criar, aceitar, cancelar)
│   ├── auth.ts
│   ├── connections.ts
│   ├── logout.ts
│   ├── notifications.ts     # Listagem, contagem e marcação de leitura
│   ├── payments.ts          # Listagem, upload de comprovante, aprovar/rejeitar/contestar
│   ├── profile.ts           # Perfis + updateBillingSettingsAction (chave Pix / timing)
│   ├── recurrenceRules.ts   # CRUD de regras de recorrência de um vínculo
│   ├── register.ts
│   └── treatmentLinks.ts    # updateTreatmentLinkPriceAction (preço padrão por paciente)
│
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout: Header + LateralMenu globais
│   ├── page.tsx        # Home pública (PresentationSection + CarouselSection)
│   ├── globals.css     # CSS global e variáveis de tema
│   └── (pages)/
│       ├── (auth)/     # Grupo sem URL — páginas de autenticação (login, register)
│       ├── about/
│       ├── notifications/      # Central de notificações (compartilhada entre roles autenticadas)
│       ├── patient/            # Área privada do paciente
│       │   ├── dashboard/
│       │   ├── search/
│       │   ├── connections/    # Gestão de conexões do paciente
│       │   ├── appointments/   # Agenda de consultas (calendário + lista)
│       │   ├── payments/       # Cobranças: acompanhar e enviar comprovantes
│       │   ├── profile/[id]/   # Visualizar perfil de um psicólogo
│       │   └── profile/        # Visualizar próprio perfil
│       ├── psychologist/       # Área privada do psicólogo
│       │   ├── dashboard/
│       │   ├── search/
│       │   ├── connections/    # Gestão de conexões do psicólogo
│       │   ├── appointments/   # Agenda de consultas (calendário + agendamento + recorrência)
│       │   ├── payments/       # Cobranças: revisar, aprovar ou rejeitar comprovantes
│       │   ├── settings/       # Configurações de cobrança (chave Pix, timing)
│       │   ├── profile/[id]/   # Visualizar perfil de um paciente
│       │   └── profile/        # Visualizar próprio perfil
│       └── admin/              # Área privada do administrador
│           ├── dashboard/
│           └── users/          # Listagem paginada de usuários
│
├── components/         # Atomic Design (Atoms, Molecules, Organism, templates)
│   ├── Atoms/          # AppointmentStatusBadge, MeetingTypeBadge, PaymentStatusBadge, etc.
│   ├── Molecules/      # Create/Cancel/DetailsAppointmentModal, Upload/Reject/DisputePaymentModal,
│   │                   # EditTreatmentPriceModal, etc.
│   └── Organism/       # PsychologistAgendaView, PatientAgendaView, PaymentsView,
│                       # BillingSettingsForm, NotificationsDropdown, ConnectionList, etc.
├── config/             # Constantes de rotas e navegação centralizada
├── constants/          # Constantes globais (Cookies, API_URL, timeouts)
├── contexts/           # Contextos React (ex: ConnectionContext)
├── data/               # Arquivos mock (ex: mock.json)
├── enums/              # Enums TypeScript mapeados do Backend (ex: RoleEnum)
├── hooks/              # Custom hooks client-side
│   ├── useActiveConnections.ts # Lista de conexões + updatePrice (preço padrão do vínculo)
│   ├── useAppointments.ts      # Estado da agenda (CRUD, recorrência, cancelamento com escopo)
│   ├── useConnectionActions.ts
│   ├── useMyPayments.ts        # Estado das cobranças (filtro por status, ações de revisão)
│   └── useNotifications.ts     # Contagem não lida (polling) + lista de notificações
├── lib/                # Utilidades puras (auth cookies, cpf mask, jwt decode puro, calendar)
├── services/           # Serviços externos e abstrações
│   ├── api/apiClient.ts# Cliente HTTP centralizado para Server Actions (inclui `postForm` p/ multipart)
│   └── cookieService.ts# Serviço de gerência de cookies HTTP-Only
└── types/              # Tipos DTO e Interfaces estritas
    ├── admin.ts, auth.ts, connection.ts, profile.ts
    ├── appointment.ts   # AppointmentDTO/CreateDTO/CancelDTO (com price, recurrenceRuleId, cancelScope)
    ├── notification.ts  # NotificationType espelhando o enum real do backend
    ├── payment.ts        # PaymentDTO, PaymentStatus, PaymentTiming, BillingSettingsUpdateDTO
    └── recurrence.ts     # RecurrenceRuleDTO/CreateDTO, RecurrenceFrequency, DayOfWeek
```

> Observação: `src/services/api/notificationApiClient.ts` é um cliente HTTP client-side (lê o token direto do cookie) que ficou sem uso após a migração para `actions/notifications.ts` — não segue o padrão Server Action/BFF do projeto e é candidato a remoção. Da mesma forma, `components/Organism/ConnectionRequestsDropdown.tsx` foi substituído por `NotificationsDropdown.tsx` no `Header` e não é mais referenciado.

---

## Documentação Extra (`/docs`)

O repositório possui uma pasta `docs/` com detalhamentos avançados:
- **Arquitetura**: Estruturas de pastas e decisões de design.
- **Autenticação**: Fluxo JWT, edge middleware e validação de role.
- **Componentes**: Guias de Atomic Design e boas práticas UI.
- **Conexões**: O sistema de vínculo paciente-psicólogo (Context API + Optimistic Updates).
- **Convenções**: Nomenclatura, TypeScript e regras de uso de Client vs Server components.

---

## Modelo de Dados (Backend)

### Entidades Principais

| Entidade         | Tabela               | Descrição                                                                                                                |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `User`           | `usuario`            | Base de autenticação e identidade                                                                                       |
| `Patient`        | `paciente`           | Perfil de paciente (1:1 com User)                                                                                       |
| `Psychologist`   | `psicologo`          | Perfil de psicólogo (1:1 com User)                                                                                      |
| `Specialty`      | `especialidade`      | Áreas de atuação (N:M com Psychologist)                                                                                 |
| `Connection`     | `conexao`            | Vínculo entre paciente e psicólogo (PENDING, ACCEPTED, etc.)                                                            |
| `TreatmentLink`  | `paciente_piscologo` | Vínculo de tratamento ativo entre paciente e psicólogo; carrega o `defaultPrice` (preço padrão da sessão)               |
| `RecurrenceRule` | `regra_recorrencia`  | Regra de recorrência (frequência, dia da semana, horários, `adjustForWeekend`) de um `TreatmentLink`, gera `Appointment`s |
| `Appointment`    | `agendamento`        | Sessão entre paciente e psicólogo; pode referenciar a `RecurrenceRule` que a gerou e tem `price` próprio                |
| `Payment`        | `pagamento`          | Cobrança de uma consulta (PENDING → AWAITING_REVIEW → APPROVED/REJECTED/DISPUTED/CANCELLED), com upload de comprovante  |
| `Notification`   | —                    | Notificações in-app tipadas por `NotificationType` (agendamento, conexão, pagamento)                                    |

---

## Sistema de Roles e Autenticação

### 3 tipos de acesso

| Role          | Enum (Frontend)         | URL Base          | Dashboard                 |
| ------------- | ----------------------- | ----------------- | ------------------------- |
| Administrador | `RoleEnum.ADMIN`        | `/admin/*`        | `/admin/dashboard`        |
| Psicólogo     | `RoleEnum.PSYCHOLOGIST` | `/psychologist/*` | `/psychologist/dashboard` |
| Paciente      | `RoleEnum.PATIENT`      | `/patient/*`      | `/patient/dashboard`      |

### Fluxo de autenticação
1. Usuário faz login (`actions/auth.ts`).
2. Backend retorna um JWT.
3. O token é salvo via `cookieService` (`psiconet_token`, httpOnly).
4. O Next.js Middleware intercepta a navegação e utiliza a função nativa `decodeRoleFromToken` (`lib/jwt.ts`, sem biblitecas pesadas como jwt-decode) para descobrir a Role.
5. Se não autenticado ou rota bloqueada, redireciona o usuário (`/login` ou dashboard correto).
6. O token é ejetado nas requisições da Server Action de forma transparente pela biblioteca customizada `apiClient.ts`.

---

## A Camada de API (`apiClient.ts`)
Para não poluir as Server Actions, todo request HTTP é canalizado pelo `src/services/api/apiClient.ts`.
- Injeta automaticamente os Headers necessários e o Token JWT.
- Controla a política de Cache (`no-store` por padrão).
- Lida centralizadamente com Parsing de Erros (`401`, `403`, `500`) fornecendo mensagens coerentes à UI (`ApiResult<T>`).
- `apiClient.postForm<T>(path, formData)`: variante para `multipart/form-data` (não força `Content-Type: application/json`), usada no upload de comprovante de pagamento — sempre com `FormData` nativo, nunca base64.

---

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

## Sistema de Notificações

- `NotificationType` no frontend (`src/types/notification.ts`) espelha exatamente o enum Java do backend (`APPOINTMENT_SCHEDULED`, `APPOINTMENT_ACCEPTED`, `APPOINTMENT_CANCELLED`, `CONNECTION_REQUESTED`, `CONNECTION_ACCEPTED`, `PAYMENT_PENDING`, `PAYMENT_RECEIPT_SUBMITTED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `PAYMENT_DISPUTED`) — não inventar novos valores sem checar `NotificationType.java`.
- `useNotifications` faz polling do contador de não lidas a cada 15s (`getUnreadCountAction`) e busca a lista completa sob demanda (ao abrir o dropdown ou a página `/notifications`).
- O backend só expõe `PATCH /notifications/{id}/read` (sem rota de bulk-read). `markAllNotificationsAsReadAction` simula "marcar todas" disparando um `PATCH` por notificação não lida em paralelo (`Promise.allSettled`).
- `NotificationsDropdown` (Header) e `NotificationsPageView` (`/notifications`) resolvem o destino do clique a partir de `referenceType` (`APPOINTMENT` | `CONNECTION` | `PAYMENT`) + role do usuário, navegando para a página correspondente (`/{role}/appointments`, `/{role}/connections` ou `/{role}/payments`).

---

## Convenções do Projeto

- **Frontend**: Server-First (App Router). `use client` apenas nas "folhas" da árvore React que precisam de interatividade.
- **Tipagem Estrita**: Nenhuma entidade de negócio pode ter tipagem inferida com `any`. Todo dado transacional mapeia-se via `src/types`.
- **Forms nativos**: A preferência é o uso nativo de `FormData` ao invés de bibliotecas pesadas, mantendo a performance alta.

---

## O que ainda NÃO existe (planejado)

- Configurações de Perfil detalhado (upload de foto real via S3/Blob)
- Notificações em tempo real via push (hoje é polling a cada 15s, não WebSockets/SSE)
- Pré-preenchimento das configurações de cobrança já salvas (depende de `GET /psychologists/me` expor `pixKey`/`paymentTiming`/`paymentAdvanceMinutes`)
- Página de "Configurações" para o paciente (hoje só existe `/psychologist/settings`; o item no menu do paciente segue `comingSoon: true`)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
