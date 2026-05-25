# cpf.ts (lib)

Módulo de utilitários puros para manipulação de CPF. Não possui dependências de React e pode ser usado tanto em Server Components quanto em Server Actions.

## Funções

### `normalizeCpf(value: string): string`

Remove todos os caracteres não numéricos e trunca o resultado a 11 dígitos.

Deve ser usado antes de qualquer envio ao backend para garantir que o servidor receba apenas dígitos.

```ts
normalizeCpf("123.456.789-01") // "12345678901"
normalizeCpf("123abc456789")   // "12345678900"
normalizeCpf("")               // ""
```

---

### `maskCpf(value: string): string`

Aplica a máscara brasileira `000.000.000-00` de forma progressiva. Chama `normalizeCpf` internamente antes de formatar.

```ts
maskCpf("12345678901") // "123.456.789-01"
maskCpf("123456")      // "123.456"
maskCpf("")            // ""
```

---

### `validateCpfLength(value: string): boolean`

Retorna `true` se o CPF (normalizado internamente) tiver exatamente 11 dígitos. Não realiza validação matemática dos dígitos verificadores.

```ts
validateCpfLength("12345678901")    // true
validateCpfLength("123.456.789-01") // true
validateCpfLength("1234567890")     // false
```

## Onde é utilizado

- [`CpfInput`](../components/CpfInput.md) — máscara e validação do componente de input
- [`register.ts`](./Register.md) — normalização defensiva antes do envio ao backend
