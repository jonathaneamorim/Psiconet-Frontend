# Fluxo de Conexões

O módulo de conexões é o núcleo da relação entre Pacientes e Psicólogos na Psiconet.

## 1. O Estado de Conexão (ConnectionStatus)

O estado relacional entre dois usuários é mapeado pelo tipo `ConnectionStatus`:
- `NONE`: Não existe nenhuma relação prévia.
- `PENDING_SENT`: O usuário logado enviou um convite, mas ainda não foi aceito.
- `PENDING_RECEIVED`: O usuário logado recebeu um convite que aguarda sua aprovação ou rejeição.
- `CONNECTED`: A conexão foi estabelecida ativamente e encontra-se vigente.

## 2. A Camada de Contexto (Global State)

A verificação de estado é custosa, especialmente durante buscas ou listagens. Para solucionar isso sem recarregar a tela inteira, a UI utiliza o provedor **ConnectionContext** (`src/contexts/ConnectionContext.tsx`).
- O Contexto atua como um dicionário (chave/valor) que armazena na memória o status de cada `targetUserId`.
- Qualquer ação performada (Conectar, Aceitar, Desvincular) atualiza o dicionário em tempo real (optimistic update), propagando a re-renderização para os botões e os labels em toda a aplicação instantaneamente.

## 3. As Server Actions de Conexão

Localizadas em `src/actions/connections.ts`:
- `getActiveConnectionsAction()`: Retorna a lista de conexões vigentes paginada.
- `getPendingRequestsAction()`: Retorna as solicitações de vínculo pendentes.
- `sendConnectionRequestAction(targetId)`: Cria a solicitação `PENDING`.
- `acceptConnectionAction(id)` e `rejectConnectionAction(id)`: Atuam num pedido pendente existente.
- `removeConnectionAction(id)`: Quebra um vínculo `CONNECTED` (Desvincular).

## 4. O Problema das Buscas (Search vs Perfil)

A funcionalidade de "Buscar Perfis" devolve uma lista de usuários (enviada por `searchPsychologistsAction`). No entanto, o backend não injeta `connectionStatus` ou `connectionId` nos endpoints de perfis singulares (`GET /psychologists/{id}`).

**Solução implementada em `actions/profile.ts`:**
Quando um usuário visualiza a página de perfil completa de alguém (Paciente ou Psicólogo), chamamos a função `getConnectionStatusAction(id)` em paralelo com a busca do perfil.
A função `getConnectionStatusAction` varre de forma eficiente as conexões ativas e pendentes e enriquece o DTO no lado do servidor, de forma que o Cliente (botão de Conexão) já carregue no estado correto na primeira renderização, sem o efeito visual de "flash" (pulando de Conectar para Desvincular).
