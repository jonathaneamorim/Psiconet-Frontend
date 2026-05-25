# Psiconet Frontend - Documentação

Bem-vindo à documentação oficial do frontend do Psiconet.
Este projeto é construído em **Next.js 16**, utilizando **Tailwind CSS** para estilização e segue princípios de **Clean Code** e **Atomic Design**.

## 📚 Índice da Documentação

A documentação está dividida nas seguintes categorias:

### 1. Arquitetura
- [Visão Geral da Arquitetura](./arquitetura/visao-geral.md): Principais decisões de design e tecnologias adotadas.
- [Estrutura de Pastas](./arquitetura/estrutura-pastas.md): Como o projeto está organizado e onde encontrar cada coisa.

### 2. Fluxos Principais
- [Fluxo de Autenticação](./auth/fluxo-autenticacao.md): Como funciona o JWT, middleware de rotas, cookies e controle de sessão.
- [Fluxo de Conexões](./conexoes/fluxo-conexoes.md): O ciclo de vida de uma conexão entre paciente e psicólogo.

### 3. Guias de Desenvolvimento
- [Padrões de Requisição à API](./api/padroes-requisicao.md): Como utilizar o `apiClient` e os Server Actions.
- [Guia de Componentes (Atomic Design)](./componentes/guia-componentes.md): Como criar, organizar e usar componentes de UI.
- [Convenções de Código](./convencoes/convencoes-codigo.md): Boas práticas, nomeclaturas e padrões TypeScript.

## 🚀 Como Contribuir

Ao criar novas funcionalidades, certifique-se de:
1. Respeitar as regras de negócio listadas no [CLAUDE.md](../CLAUDE.md).
2. Seguir as [Convenções de Código](./convencoes/convencoes-codigo.md).
3. Não introduzir estado complexo em componentes UI (separe em `hooks` ou `actions`).
4. Reutilizar ao máximo as tipagens centralizadas (`src/types`).
