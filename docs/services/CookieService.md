# Cookie Service

Serviço centralizado para o gerenciamento de cookies executado exclusivamente no lado do servidor (Server Actions e Server Components).

## Responsabilidade
- Centralizar o uso de `cookies()` do `next/headers`.
- Aplicar opções seguras por padrão (`httpOnly`, `secure`, `sameSite`, etc).
- Abstrair a lógica de cálculo de tempo de vida de sessão.

## Estrutura do Serviço (`src/services/cookieService.ts`)

O serviço exporta o objeto `cookieService` que contém os seguintes métodos:

### Métodos Base
- `get(name)`: Recupera o valor de um cookie.
- `set(name, value, options?)`: Salva um cookie mesclando as configurações fornecidas com as configurações padrão seguras.
- `remove(name)`: Remove um cookie pelo nome.
- `exists(name)`: Verifica se um cookie existe.

### Métodos de Autenticação (`auth cookies`)
Métodos convenientes que utilizam as constantes do projeto para gerenciar o token de acesso:
- `getAuthToken()`: Retorna o token JWT do usuário salvo nos cookies.
- `setAuthToken(token, remember)`: Salva o token JWT de autenticação. Calcula o tempo de expiração dependendo da flag `remember`.
- `clearAuth()`: Remove o token JWT, efetuando o logout do usuário.

## Integração

Este serviço está integrado aos seguintes módulos:
- **Server Actions**: `src/actions/auth.ts`, `src/actions/admin.ts`, `src/actions/logout.ts`
- **Library**: `src/lib/auth.ts`

**Importante:** Por utilizar a API `next/headers`, tentar importar este serviço diretamente em componentes React que rodam no cliente (marcados com `'use client'`) resultará em erro de compilação. Todas as interações com os cookies do sistema devem ocorrer através de Server Actions que consomem este serviço.
