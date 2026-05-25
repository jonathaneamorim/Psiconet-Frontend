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
│   ├── auth.ts         
│   ├── connections.ts  
│   ├── profile.ts      
│   └── register.ts     
│
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout: Header + LateralMenu globais
│   ├── page.tsx        # Home pública (PresentationSection + CarouselSection)
│   ├── globals.css     # CSS global e variáveis de tema
│   └── (pages)/
│       ├── (auth)/     # Grupo sem URL — páginas de autenticação (login, register)
│       ├── about/
│       ├── patient/            # Área privada do paciente
│       │   ├── dashboard/
│       │   ├── search/         
│       │   ├── connections/    # Gestão de conexões do paciente
│       │   ├── profile/[id]/   # Visualizar perfil de um psicólogo
│       │   └── profile/        # Visualizar próprio perfil
│       ├── psychologist/       # Área privada do psicólogo
│       │   ├── dashboard/
│       │   ├── search/         
│       │   ├── connections/    # Gestão de conexões do psicólogo
│       │   ├── profile/[id]/   # Visualizar perfil de um paciente
│       │   └── profile/        # Visualizar próprio perfil
│       └── admin/              # Área privada do administrador
│           ├── dashboard/
│           └── users/          # Listagem paginada de usuários
│
├── components/         # Atomic Design (Atoms, Molecules, Organism, templates)
├── config/             # Constantes de rotas e navegação centralizada
├── constants/          # Constantes globais (Cookies, API_URL, timeouts)
├── contexts/           # Contextos React (ex: ConnectionContext)
├── data/               # Arquivos mock (ex: mock.json)
├── enums/              # Enums TypeScript mapeados do Backend (ex: RoleEnum)
├── hooks/              # Custom hooks client-side (ex: useConnectionActions)
├── lib/                # Utilidades puras (auth cookies, cpf mask, jwt decode puro)
├── services/           # Serviços externos e abstrações
│   ├── api/apiClient.ts# Cliente HTTP centralizado para Server Actions
│   └── cookieService.ts# Serviço de gerência de cookies HTTP-Only
└── types/              # Tipos DTO e Interfaces estritas (AdminUser, PaginatedResponse)
```

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

| Entidade       | Tabela          | Descrição                                                    |
| -------------- | --------------- | ------------------------------------------------------------ |
| `User`         | `usuario`       | Base de autenticação e identidade                            |
| `Patient`      | `paciente`      | Perfil de paciente (1:1 com User)                            |
| `Psychologist` | `psicologo`     | Perfil de psicólogo (1:1 com User)                           |
| `Specialty`    | `especialidade` | Áreas de atuação (N:M com Psychologist)                      |
| `Appointment`  | `agendamento`   | Sessão entre paciente e psicólogo                            |
| `Connection`   | `conexao`       | Vínculo entre paciente e psicólogo (PENDING, ACCEPTED, etc.) |

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

---

## Sistema de Conexões

Sistema social onde Pacientes e Psicólogos se conectam:
- Listagem otimista: Uso de `ConnectionContext` para reagir em real-time a mudanças de status (Conectar, Remover, etc) sem reload.
- `useConnectionActions`: Hook encapsulador que abstrai as chamadas HTTP e controla toasts/loading.
- As Server Actions de perfis rodam em paralelo para buscar os dados de perfil + checar o estado de conexão com o remetente atual (via Promise.all).

---

## Convenções do Projeto

- **Frontend**: Server-First (App Router). `use client` apenas nas "folhas" da árvore React que precisam de interatividade.
- **Tipagem Estrita**: Nenhuma entidade de negócio pode ter tipagem inferida com `any`. Todo dado transacional mapeia-se via `src/types`.
- **Forms nativos**: A preferência é o uso nativo de `FormData` ao invés de bibliotecas pesadas, mantendo a performance alta.

---

## O que ainda NÃO existe (planejado)

- Agenda / calendário de consultas (psicólogo)
- Listagem e agendamento prático de sessões (paciente)
- Configurações de Perfil detalhado (upload de foto real via S3/Blob)
- Notificações completas em tempo real (WebSockets ou SSE)
