# Psiconet — Contexto para IAs (Frontend + Backend)

> Este arquivo descreve a arquitetura, convenções e contexto completo do projeto Psiconet para que IAs (Claude, Gemini, GPT, etc.) possam entender o sistema rapidamente sem precisar explorar o código do zero.

---

## O que é o Psiconet

Psiconet é uma plataforma web de saúde mental que conecta **pacientes** a **psicólogos**. Possui um painel administrativo para gestão da plataforma. O **frontend** é um cliente web em **Next.js 15 (App Router)** que consome uma **API REST** construída em **Java/Spring Boot 3.3.5**.

---

## Stack Técnica

### Frontend

| Camada       | Tecnologia                                         |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 15 com App Router                          |
| Linguagem    | TypeScript                                         |
| Estilo       | CSS + Tailwind utility classes (globals.css)       |
| Fonte        | Raleway (Google Fonts)                             |
| Auth         | JWT armazenado em cookie httpOnly                  |
| API          | REST (Spring Boot) — URL via `NEXT_PUBLIC_API_URL` |
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

## Estrutura de Diretórios

### Frontend (`src/`)

```
src/
├── actions/            # Server Actions do Next.js
│   ├── admin.ts        # getUsersAction, updateUserStatusAction, updateUserAction
│   ├── auth.ts         # loginAction (POST /auth/login, seta cookie JWT)
│   ├── logout.ts       # logoutAction (deleta cookie)
│   └── register.ts     # registerAction (cadastro de paciente)
│
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout: Header + LateralMenu globais
│   ├── page.tsx        # Home pública (PresentationSection + CarouselSection)
│   ├── globals.css     # CSS global e variáveis de tema
│   └── (pages)/
│       ├── (auth)/     # Grupo sem URL — páginas de autenticação
│       │   ├── layout.tsx      # Layout centralizado (max-w-500px)
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       ├── about/
│       ├── patient/            # Área privada do paciente
│       │   └── dashboard/page.tsx
│       ├── psychologist/       # Área privada do psicólogo
│       │   └── dashboard/page.tsx
│       └── admin/              # Área privada do administrador
│           ├── dashboard/page.tsx
│           └── users/page.tsx  # Listagem paginada de usuários
│
├── components/         # Atomic Design
│   ├── Atoms/
│   │   ├── Button.tsx
│   │   ├── UserStatusBadge.tsx  # Badge colorido de status (ACTIVE, INACTIVE, etc.)
│   │   └── UserRoleBadge.tsx    # Badge colorido de role (ADMIN, PSYCHOLOGIST, PATIENT)
│   ├── Molecules/
│   │   ├── InputLabel.tsx
│   │   ├── CarouselCard.tsx
│   │   ├── TextBlock.tsx
│   │   ├── EditUserModal.tsx  # Modal de edição (PUT /admin/users/{id})
│   │   ├── ConfirmModal.tsx   # Modal de confirmação reutilizável
│   │   └── Pagination.tsx     # Paginação URL-driven (Link do Next.js)
│   ├── Organism/
│   │   ├── Header.tsx          # Header global (adapta por role)
│   │   ├── LateralMenu.tsx     # Sidebar global (adapta por role)
│   │   ├── UsersTable.tsx      # Tabela de usuários (desktop) + cards (mobile)
│   │   ├── Carousel.tsx
│   │   ├── CarouselSection.tsx
│   │   └── PresentationSection.tsx
│   └── templates/
│       ├── FormLogin.tsx
│       └── FormRegister.tsx
│
├── config/
│   └── routes.ts       # Constantes de URL (ROUTES, PUBLIC_ROUTES)
│
├── constants/
│   ├── api.ts          # API_URL
│   ├── auth.ts         # Tempos de sessão (minutos/dias)
│   └── cookies.ts      # Nome do cookie e prefixo de role
│
├── enums/
│   └── RoleEnum.ts     # ADMIN | PSYCHOLOGIST | PATIENT + translateRole()
│
├── lib/
│   ├── auth.ts         # getUserRole() — lê cookie e decodifica JWT (server-side)
│   └── jwt.ts          # decodeRoleFromToken() — pura, funciona no Edge Runtime
│
├── proxy.ts            # Middleware Next.js — proteção de rotas por role
└── types/
    └── auth.ts         # AuthResponse, JwtPayload
```

### Backend (`src/main/java/com/psiconet/`)

```
com.psiconet/
├── controllers/        # REST Endpoints (Auth, User, Admin, Psychologist)
├── infra/              # Infraestrutura (Security, Exceptions, Config, Swagger)
├── mapper/             # Interfaces MapStruct (DTO <-> Entity)
├── model/
│   ├── entities/       # Entidades JPA (Access, Clinical, Document, Financial, Profile)
│   ├── dtos/           # DTOs (Auth, Admin, Profile, Access)
│   └── enums/          # Enumerações (Roles, Statuses)
├── repositories/       # Repositórios Spring Data JPA
└── services/
    ├── interfaces/     # Definições de serviço
    └── implement/      # Implementações de serviço
```

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

### Campos do `User`

`id`, `email`, `cpf`, `password`, `role`, `status`, `fullName`, `phone`, `photoUrl`, `location`

### Campos do `Psychologist`

`id`, `usuario_id`, `crp`, `experienceTime`, `description` + relacionamento N:M com `Specialty`

---

## Sistema de Roles e Autenticação

### 3 tipos de acesso

| Role          | Enum (Frontend)         | Enum (Backend) | URL Base          | Dashboard                 |
| ------------- | ----------------------- | -------------- | ----------------- | ------------------------- |
| Administrador | `RoleEnum.ADMIN`        | `ADMIN`        | `/admin/*`        | `/admin/dashboard`        |
| Psicólogo     | `RoleEnum.PSYCHOLOGIST` | `PSYCHOLOGIST` | `/psychologist/*` | `/psychologist/dashboard` |
| Paciente      | `RoleEnum.PATIENT`      | `PATIENT`      | `/patient/*`      | `/patient/dashboard`      |

### Fluxo de autenticação

1. Usuário faz login via `loginAction` (`src/actions/auth.ts`)
2. Backend retorna um JWT com `role: "ROLE_PATIENT"` (ou `ROLE_PSYCHOLOGIST`, `ROLE_ADMIN`)
3. O token é armazenado em **cookie httpOnly** chamado `psiconet_token`
4. O middleware (`src/proxy.ts`) intercepta todas as requisições:
   - Sem token → redireciona para `/login`
   - Token inválido → deleta cookie, redireciona para `/login`
   - Usuário logado acessando página pública → redireciona para `/${userRole}/dashboard`
   - Usuário tentando acessar rota de outro role → redireciona para seu dashboard
5. O JWT é decodificado com `decodeRoleFromToken()` (sem biblioteca, puro base64)
6. O role é exposto via `getUserRole()` no root layout para personalizar Header e LateralMenu

### JWT payload esperado do backend

```json
{
  "sub": "usuario@email.com",
  "role": "ROLE_PATIENT"
}
```

O prefixo `ROLE_` é removido e lowercased → vira `"patient"` (confere com `RoleEnum`).

---

## API Endpoints (Backend)

### Autenticação (público)

| Método | Endpoint                      | Descrição             |
| ------ | ----------------------------- | --------------------- |
| `POST` | `/auth/register/patient`      | Cadastro de paciente  |
| `POST` | `/auth/register/psychologist` | Cadastro de psicólogo |
| `POST` | `/auth/login`                 | Login — retorna JWT   |

### Psicólogos

| Método | Endpoint                                      | Descrição           |
| ------ | --------------------------------------------- | ------------------- |
| `GET`  | `/psychologists/search?name={name}&crp={crp}` | Busca de psicólogos |

### Admin (requer `ROLE_ADMIN`)

| Método  | Endpoint                   | Descrição                                                       |
| ------- | -------------------------- | --------------------------------------------------------------- |
| `GET`   | `/admin/users`             | Lista paginada de usuários (parâmetros: `page`, `size`, `sort`) |
| `PATCH` | `/admin/users/{id}/status` | Atualiza apenas o status do usuário                             |
| `PUT`   | `/admin/users/{id}`        | Atualiza `fullName`, `phone` e `status`                         |

### Campos protegidos no Admin

- **Editáveis:** `fullName`, `phone`, `status`
- **Protegidos (nunca alteráveis via admin):** `id`, `email`, `cpf`, `role`, `createdAt`
- **CPF:** exibido mascarado como `123.***.***-45` nas listagens

---

## Tratamento de Erros (Backend)

Gerenciado pelo `GlobalExceptionHandler`:

| Status             | Situação                                   |
| ------------------ | ------------------------------------------ |
| `400 Bad Request`  | Erros de validação ou regras de negócio    |
| `401 Unauthorized` | JWT ausente ou inválido                    |
| `404 Not Found`    | Entidade não encontrada                    |
| `409 Conflict`     | Dados duplicados (e-mail/CPF já existente) |

---

## Rotas (src/config/routes.ts)

```typescript
ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about',
  PATIENT_DASHBOARD: '/patient/dashboard',
  PSYCHOLOGIST_DASHBOARD: '/psychologist/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
};

PUBLIC_ROUTES = ["/", "/login", "/register", "/about"];
```

---

## Middleware (src/proxy.ts)

O arquivo `proxy.ts` exporta a função `proxy` e o `config.matcher`. O `middleware.ts` na raiz do Next.js chama esse proxy.

**Matcher atual:**

```
'/', '/login', '/register', '/about',
'/admin/:path*', '/psychologist/:path*', '/patient/:path*'
```

---

## Componentes Globais Importantes

### Header (`src/components/Organism/Header.tsx`)

- Renderizado no root layout para **todas as páginas**
- Mostra nav pública (Início, Sobre, Entrar, Cadastrar) quando `userRole === null`
- Mostra perfil do usuário (dropdown) quando autenticado
- Usa `roleLabel` e `roleAccessLabel` para exibir o nome correto do perfil (Paciente / Psicólogo / Administrador)
- Recebe `userRole: RoleEnum | null` como prop

### LateralMenu (`src/components/Organism/LateralMenu.tsx`)

- Sidebar colapsável, visível **apenas quando autenticado**
- Fica fixo à esquerda, 64px colapsado / 384px expandido no hover
- Itens são condicionais por role:
  - **Todos os roles:** Dashboard
  - **Admin:** bloco vazio pronto para receber novos itens
  - **Psychologist:** Pacientes (Em breve) + Configurações (Em breve)
  - **Patient:** Consultas (Em breve) + Configurações (Em breve)

---

## Convenções do Projeto

### Frontend

- **Componentes:** `PascalCase.tsx`
- **Utilitários/configs:** `camelCase.ts`
- **Diretórios de página:** `kebab-case/`
- **Atomic Design:** Atoms → Molecules → Organism → Templates
- **Server Actions:** toda mutação via API usa Next.js Server Actions em `src/actions/` — sem client-side fetch para auth
- **Alias de importação:** `@/ → src/` (configurado em `tsconfig.json`)

### Backend

- **Nomenclatura:** Java CamelCase padrão
- **Entidades:** sempre com `@Getter`, `@Setter`, `@NoArgsConstructor` (Lombok)
- **Comunicação:** sempre via DTOs (nunca expõe entidades diretamente)
- **Mapeamento:** MapStruct para conversões DTO ↔ Entity
- **Validação:** Bean Validation (`@NotBlank`, `@Email`, etc.)
- **Testes:** unitários nos serviços e integração nos controllers

---

## CSS / Tema

Variáveis CSS em `globals.css`:

- `--primary` — cor principal
- `--secondary` — cor secundária
- `--tertiary` — cor terciária

---

## Variáveis de Ambiente

| Variável                        | Descrição                             |
| ------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | URL base da API Spring Boot           |
| `NEXT_PUBLIC_COOKIE_TOKEN_NAME` | Nome do cookie JWT (`psiconet_token`) |
| `NEXT_PUBLIC_ROLE_PREFIX`       | Prefixo de role no JWT (`ROLE_`)      |
| `KEEP_LOGGED_TIME`              | Dias para "Manter conectado" (`7`)    |
| `ACCESS_TIME`                   | Minutos de sessão padrão (`180`)      |

---

## Links Úteis

- **Swagger UI (local):** `http://localhost:8080/swagger-ui/index.html`
- **Frontend Repo:** [Psiconet-Frontend](https://github.com/jonathaneamorim/Psiconet-Frontend)

---

## Branch Atual

`feat/admin-screen` — Adicionando suporte completo ao perfil de Administrador:

- [x] Estrutura de diretório `/admin/dashboard/`
- [x] Header corrigido para exibir "Administrador"
- [x] LateralMenu com link "Usuários" para admin
- [x] Tela `/admin/users` — listagem paginada (20/página), edição e toggle de status
- [ ] Tela de dashboard do admin (em construção)

---

## O que ainda NÃO existe (planejado)

- Tela de dashboard do admin com métricas e resumos
- Agenda / calendário (psicólogo)
- Listagem e agendamento de consultas (paciente)
- Perfil editável de usuário
- Notificações
- Audit logging via entidade `ChangeLog` (estrutura backend preparada)
