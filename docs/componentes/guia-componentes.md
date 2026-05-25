# Guia de Componentes

O projeto segue a filosofia de design de **Atomic Design** adaptada para a vida real de um projeto React.

## O Que É Cada Coisa

### 1. Atoms (Átomos)
`src/components/Atoms/`
Elementos unitários de interface que não têm utilidade caso sejam divididos. Não costumam gerenciar estados de forma autônoma.
- **Exemplos**: `Button.tsx`, `UserStatusBadge.tsx`, `UserRoleBadge.tsx`.

### 2. Molecules (Moléculas)
`src/components/Molecules/`
Pequenos grupos funcionais compostos por um ou mais átomos atuando juntos para um objetivo singular. Frequentemente representam blocos de formulário.
- **Exemplos**: `InputLabel.tsx` (Label + Input genérico), `CpfInput.tsx` (Possui lógica interna de máscara), `EditUserModal.tsx` (Janela de interface unitária).

### 3. Organisms (Organismos)
`src/components/Organism/`
Aglomerados complexos e distintos no layout que carregam responsabilidades independentes e gerenciam comportamentos robustos ou conectam-se ativamente com Server Actions/Hooks pesados.
- **Exemplos**: `ConnectionList.tsx` (Orquestrador total do ciclo de listar conexões e gerenciar loading local), `UsersTable.tsx` (Listagem rica com modais).

### 4. Templates
`src/components/templates/`
A camada macro que acomoda e estrutura outros blocos genéricos, fornecendo o esqueleto do layout principal de formulários complexos.
- **Exemplos**: `FormLogin.tsx`, `FormRegister.tsx`.

---

## Regras para Componentes

1. **Apenas Diretórios Categóricos:** Não devem existir componentes soltos e desassociados rodando avulsos na pasta `src/components/`. Apenas dentro dos respectivos baldes (`Atoms`, `Organism` etc).
2. **Prop Drilling Controlado:** Se você estiver passando as mesmas propriedades por mais de 3 níveis de profundidade, pare. Extraia e utilize Context (como fizemos no `ConnectionContext`).
3. **Responsividade Integrada:** Todo organismo novo *tem* o dever moral de possuir comportamentos integrados de re-alinhamento responsivo em classes CSS (`hidden md:block` etc). Formulários e tabelas devem sempre possuir formato em `flex-col` para Mobile.
