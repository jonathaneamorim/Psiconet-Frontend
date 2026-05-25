# Estrutura de Pastas

Abaixo está o mapa mental da nossa estrutura de diretórios e o que se espera encontrar em cada lugar. O projeto evita aninhamento profundo sem necessidade.

```text
src/
├── actions/             # Server Actions (Ponte com o backend Spring Boot)
│   ├── admin.ts
│   ├── auth.ts
│   └── ...
│
├── app/                 # Next.js App Router (Rotas e Páginas)
│   ├── (pages)/         # Agrupamento lógico de páginas sem afetar a URL
│   │   ├── admin/
│   │   ├── patient/
│   │   └── psychologist/
│   ├── layout.tsx       # Layout raiz
│   └── page.tsx         # Página inicial (Home)
│
├── components/          # Componentes visuais baseados em Atomic Design
│   ├── Atoms/           # Componentes fundamentais (Botão, Badge, Icone)
│   ├── Molecules/       # Combinação de átomos (Input + Label, Select)
│   ├── Organism/        # Blocos complexos e auto-contidos (Tabelas, Listas de Cards)
│   └── templates/       # Layouts macro para formulários genéricos (ex: Login, Register)
│
├── config/              # Configurações globais 
│   ├── navigation.tsx   # Configuração de menus e links por Role
│   └── routes.ts        # Constantes das URIs (Evita 'magic strings')
│
├── constants/           # Valores estáticos do sistema
│   ├── api.ts           # URL da API
│   ├── auth.ts          # Tempo de acesso e timeout
│   └── cookies.ts       # Nomes dos cookies (ex: psiconet_token)
│
├── contexts/            # Contextos React Globais (use client)
│   └── ConnectionContext.tsx  # Estado global da sessão de conexões
│
├── data/                # Dados mockados e conteúdos fixos
│   └── mock.json        # Textos da página inicial
│
├── enums/               # Enumeradores TypeScript do sistema
│   └── RoleEnum.ts      
│
├── hooks/               # Custom hooks React ('use client')
│   ├── useActiveConnections.ts 
│   └── useConnectionActions.ts
│
├── lib/                 # Funções utilitárias puras (sem dependência de API/Estado)
│   ├── auth.ts          # Utils relacionados a cookies e JWT (Server Only)
│   ├── cpf.ts           # Máscaras e validações matemáticas puras
│   └── jwt.ts           # Decode de tokens agnóstico de ambiente
│
├── services/            # Serviços utilitários independentes 
│   ├── api/             # Camada de comunicação HTTP
│   │   └── apiClient.ts
│   └── cookieService.ts # Abstração de next/headers (cookies)
│
└── types/               # Tipagens TypeScript compartilhadas e Interfaces globais
    ├── admin.ts
    ├── auth.ts
    ├── connection.ts
    └── profile.ts
```

### Regras de Ouro de Estrutura:
- **Server Actions nunca devem importar pacotes UI (`use client`).**
- **Arquivos na raiz de `src/components`** (que não estão em Atoms/Molecules/Organism) devem ser refatorados para o padrão Atomic.
- **Tipos de Resposta de API** devem viver em `src/types`, não isolados dentro do arquivo da Server Action.
