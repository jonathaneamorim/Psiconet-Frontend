# Padrões de Requisição à API

Toda comunicação entre o frontend da Psiconet e o backend Spring Boot é feita através do nosso **apiClient** (`src/services/api/apiClient.ts`).

## 1. Como usar o `apiClient`

O cliente encapsula toda a verbosidade do `fetch` original: injeção de tokens JWT, definição de Content-Type e serialização JSON.

### Exemplo de uso num Server Action
```typescript
'use server';

import { apiClient } from '@/services/api/apiClient';
import type { PaginatedResponse } from '@/types/connection';
import type { PsychologistProfile } from '@/types/profile';

// Fazendo um GET
export async function searchPsychologistsAction(name: string) {
  const params = new URLSearchParams({ name });
  return apiClient.get<PaginatedResponse<PsychologistProfile>>(`/psychologists/search?${params}`);
}

// Fazendo um POST (sem precisar dar JSON.stringify ou enviar Headers manually)
export async function sendConnectionRequestAction(targetUserId: string) {
  const result = await apiClient.post<{ id?: string }>(`/connections/${targetUserId}`);
  if (result.error) return { error: result.error };
  return { success: true, connectionId: result.data?.id };
}
```

## 2. Tipagem do Retorno: `ApiResult<T>`

Toda requisição retorna uma Promise contendo a interface padronizada `ApiResult<T>`:
```typescript
export interface ApiResult<T = void> {
  data?: T;
  error?: string;
  status?: number;
}
```
Isso força a camada de Interface de Usuário ou Actions superiores a checarem `if (result.error)` antes de lidarem com os dados da interface.

## 3. Erros de HTTP Padrões

Se o backend retornar código de status `>= 400`, o cliente tentará extrair o `message` contido no body da resposta Spring Boot. Caso a resposta seja vazia ou sem `message`, ele fará o *fallback* para um mapeamento local de erros (ex: 401 vira "Sessão expirada. Faça login novamente.").

## 4. Requisições Públicas

Existem requisições (como Login e Cadastro) que não exigem a injeção do token via Bearer Auth (o que geraria erro de "Token Inválido"). Nestes casos, adicionamos a propriedade `{ public: true }` nas opções:

```typescript
const result = await apiClient.post('/auth/register', payload, { public: true });
```
