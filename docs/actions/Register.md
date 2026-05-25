# Register

Responsável por realizar o cadastro de novos usuários (paciente ou psicólogo) via requisição ao backend.

Determina o endpoint correto com base no `role` selecionado no formulário:
- `PATIENT` → `POST /auth/register/patient`
- `PSYCHOLOGIST` → `POST /auth/register/psychologist`

## Normalização do CPF

Antes de montar o payload de requisição, o CPF é normalizado com `normalizeCpf()` — removendo qualquer formatação que o frontend possa ter enviado. Isso garante que o backend receba sempre apenas os 11 dígitos numéricos.

```ts
cpf: normalizeCpf(formData.get("cpf")?.toString() ?? '')
```

Essa camada defensiva existe mesmo que o componente [`CpfInput`](../components/CpfInput.md) já envie o valor normalizado via hidden input, protegendo contra mudanças futuras no formulário.

## Integração

- Chamado por [`FormRegister`](../components/FormRegister.md)
- Utiliza [`normalizeCpf`](../lib/cpf.md) de `@/lib/cpf`
- Em caso de erro do backend, repassa os erros por campo via `fields` para o formulário exibir inline
