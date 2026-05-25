# Visão Geral da Arquitetura

O Psiconet Frontend utiliza uma abordagem moderna e opinionada baseada no App Router do **Next.js 16**.

## Princípios Arquiteturais

### 1. Server-First (Server Components e Server Actions)
Priorizamos a renderização no servidor (SSR) para SEO, performance inicial e segurança. 
A comunicação com o backend Spring Boot é orquestrada por **Server Actions**, que operam como um "BFF (Backend For Frontend)".

- **Vantagens:** Ocultação de tokens e URLs reais da API, redução do JavaScript enviado ao cliente, fetch paralelo via `Promise.all`.
- **Regra de Ouro:** Páginas (`page.tsx`) e `actions` são *sempre* rodados no servidor (`'use server'`).

### 2. Client Components (`'use client'`)
Reservamos o `'use client'` estritamente para interatividade (hooks de estado, transições, formulários, botões).
Sempre empurramos os Client Components para as folhas (folhagens) da árvore de componentes, mantendo os componentes de layout no servidor.

### 3. Atomic Design
A interface é baseada em componentes visuais independentes:
- **Atoms**: Botões, badges, inputs simples.
- **Molecules**: Combinação de átomos (ex: `InputLabel`, Modais).
- **Organisms**: Combinação complexa com lógica de orquestração (ex: `UsersTable`, `ConnectionList`).

### 4. Camada de Serviço de API (`apiClient`)
Isolamos a complexidade de rede (Injeção de Token, Headers Padrões, Error Handling, Cache Control) em um arquivo único: `src/services/api/apiClient.ts`.
Isso reduz duplicação de código e padroniza a captura de erros HTTP de forma previsível (retornando um `ApiResult`).

### 5. Tipagem Centralizada e Estrita
Evitamos tipagens inferidas fracas ou tipos "any". Todas as entidades de negócio compartilhadas com o backend são tipadas em `src/types/` (ex: `AdminUser`, `PaginatedResponse`, `PsychologistProfile`).
