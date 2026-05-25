# Fluxo de Autenticação

A aplicação Psiconet baseia sua segurança no uso de tokens JWT fornecidos pelo backend Spring Security. A arquitetura de autenticação se divide entre o armazenamento seguro via Cookies no lado servidor, decodificação do papel do usuário e controle de middleware via rotas.

## 1. O Token (JWT)

Quando um usuário faz login via `loginAction` (`src/actions/auth.ts`), a API retorna um JWT.
Este token é salvo como um **cookie HttpOnly** através do `cookieService.ts`.

Isso garante que:
- Scripts client-side (XSS) não podem ler o token.
- O token é automaticamente enviado nas requisições SSR (Server Actions e Pages).

## 2. Decodificação da Role (Papel)

O sistema exige roteamento baseado no tipo do usuário (`ADMIN`, `PATIENT`, `PSYCHOLOGIST`). O Spring Boot injeta a role no payload do JWT no formato `ROLE_ADMIN`, `ROLE_PATIENT`, etc.

O processo de decodificação:
1. Lemos o JWT.
2. Utilizamos `decodeRoleFromToken` (em `src/lib/jwt.ts`).
3. Removemos o prefixo `ROLE_` e deixamos em caixa baixa (ex: `ROLE_ADMIN` → `admin`).

A biblioteca externa `jwt-decode` foi removida em favor de uma implementação `atob` pura e simples em `lib/jwt.ts` para que possa funcionar eficientemente tanto em Server Actions quanto em middlewares Edge.

## 3. Middleware e Controle de Acesso (Rotas Protegidas)

O roteamento condicional ocorre dentro de `src/middleware.ts` (Edge Runtime).

### Lógica principal do Middleware:
1. O Middleware intercepta a requisição.
2. Extrai o cookie definido por `COOKIE_TOKEN` (`constants/cookies.ts`).
3. Tenta decodificar a `role` do usuário.
4. Faz a validação contra o path acessado:
   - Se o usuário tentar acessar `/{role}/*` mas sua role decodificada for diferente, ele é redirecionado para `/${userRole}/dashboard`.
   - Se o usuário tentar acessar a rota `/admin/*` e não for um admin, ele será barrado.
   - Se um usuário autenticado tentar acessar `/login` ou `/register`, será levado para seu próprio painel.
   - Se o token expirar ou for inválido, é redirecionado para `/login`.

## 4. O papel do `apiClient.ts`

Nas comunicações subsequentes com a API, o cliente HTTP nativo construído internamente (`src/services/api/apiClient.ts`):
1. Recupera o cookie autenticado sob demanda no momento da execução.
2. Anexa-o nos headers: `Authorization: Bearer <token>`.
3. Caso a API retorne um erro HTTP 401, o erro propagará corretamente a mensagem para redirecionar o usuário (expiração de sessão).
