# Convenções de Código

Abaixo estão listadas as convenções adotadas neste repositório. Sempre utilize-as como fonte de verdade durante a escrita de novos códigos.

## 1. Nomenclatura (Naming)
- **Componentes React**: PascalCase. Ex: `UserProfileCard.tsx`
- **Hooks React**: camelCase com prefixo "use". Ex: `useActiveConnections.ts`
- **Server Actions**: camelCase e com sufixo "Action". Ex: `searchPsychologistsAction.ts`. Sempre localizados na pasta `src/actions`.
- **Interfaces e Types**: PascalCase. Sem prefixo de interface (nunca usar `IUsuario` ou `IType`).

## 2. Tipagem (TypeScript)
- Evite `any` a qualquer custo.
- Centralize definições tipificadas em `src/types/`. Não defina DTOs longos dentro do corpo da Action.
- Utilize Enum apenas se existir espelho e mapeamento direto no Backend (como `RoleEnum.ts`). Do contrário, favoreça Union Types simples no TypeScript (ex: `type UserStatus = 'ACTIVE' | 'INACTIVE'`).

## 3. Server Components VS Client Components
- Prefira usar **Server Components**. A renderização ocorre de maneira nativa e silenciosa pela Vercel/Node sem overhead.
- Utilize a flag `'use client'` apenas na primeira linha de componentes que requerem hooks do React (como `useState`, `useEffect`) ou interação ativa (click events, drag-and-drop).
- Componentes com `'use client'` não podem ser importados como provedores wrapper contendo código Server Action direto, ao não ser sob prop de `children`.

## 4. O Padrão de Exportação "Barrel" (ou a falta dele)
- Não usamos arquivos `index.ts` extensivos exportando e aninhando componentes (Padrão Barrel) devido à otimização e complicação no Tree-Shaking.
- Favor importe os componentes referenciando diretamente a sua exata origem `import { Button } from '@/components/Atoms/Button'`.

## 5. Clean Code em Forms
- Evite criar `useState` infinito ligando campo-a-campo (`name, setName, cpf, setCpf, age, setAge`).
- Favoreça fortemente a utilização da classe nativa WebAPI `FormData`.
- Extraia erros validados para estados visuais locais e acione notificações (`react-hot-toast`) somente quando necessário.
