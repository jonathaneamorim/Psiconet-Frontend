# CpfInput

Componente controlado responsável por exibir e tratar campos de CPF em formulários.

Aplica máscara automática em tempo real no formato `000.000.000-00`, bloqueia caracteres inválidos e sanitiza colagem de texto.

Renderiza dois inputs internamente:
- Um input **visível** que exibe o CPF formatado (sem `name`, não vai ao FormData)
- Um input **hidden** com `name="cpf"` que carrega sempre o CPF normalizado (apenas dígitos)

Dessa forma, o servidor nunca recebe CPF formatado — apenas a sequência numérica limpa.

## Props

| Prop | Tipo | Descrição |
|---|---|---|
| `error` | `string?` | Mensagem de erro vinda do backend ou do formulário pai |
| `onClearError` | `() => void?` | Chamado ao focar o campo — limpa o estado de erro do pai |
| `labelStyle` | `string?` | Classes CSS adicionais para o label |
| `inputStyle` | `string?` | Classes CSS adicionais para o input visível |

## Comportamentos

- **Digitação:** apenas dígitos são aceitos; máscara aplicada progressivamente
- **Colagem (`paste`):** sanitiza automaticamente, remove não-dígitos e aplica máscara
- **Limite:** bloqueado após 11 dígitos numéricos (`maxLength={14}` conta caracteres de máscara)
- **Validação ao blur:** exibe "CPF deve ter 11 dígitos." se o campo for preenchido parcialmente
- **Mobile:** `inputMode="numeric"` abre teclado numérico no iOS/Android
- **Acessibilidade:** `aria-invalid` e `aria-label` presentes

## Uso

```tsx
import { CpfInput } from '@/components/Molecules/CpfInput';

<CpfInput
  error={fieldErrors["cpf"]}
  onClearError={() => clearFieldError("cpf")}
/>
```

O `FormData` do formulário que envolve esse componente terá automaticamente `cpf` com o valor normalizado.

## Integração

Integrado com os utilitários de [`src/lib/cpf.ts`](../lib/cpf.md).

Utilizado atualmente em:
- [`FormRegister`](./FormRegister.md)
