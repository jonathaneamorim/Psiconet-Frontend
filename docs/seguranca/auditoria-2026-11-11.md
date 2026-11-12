# Auditoria de segurança e bugs — Frontend (2026-11-11)

> Relatório vivo. Branch `fix/auditoria-seguranca` (a partir de `main` @ `3abffa8`). Decisões e achados do
> backend: `../Psiconet-Backend/docs/seguranca/auditoria-2026-11-11.md` e ADR 017 do backend.

## Linha de base × depois

| Verificação | Antes | Depois |
|---|---|---|
| `npx tsc --noEmit` | ok | ok |
| `npm test` | 136 testes ok | **145 testes ok** |
| `npm run lint` | **19 erros**, 32 avisos | **0 erros**, 41 avisos |
| `npm audit --omit=dev` | **1 crítica, 2 altas** | **0** |
| `npm run build` | — | ok (Next 16.4.3) |

## Achados

| ID | Sev. | Arquivo(s) | Descrição | Status | Commit | Teste |
|---|---|---|---|---|---|---|
| AUD-FE-01 | Crítica | `package.json` | `next` 16.0–16.4.0: RCE (next/og, Image Optimization com SVG, `use cache`), SSRF, cache poisoning, DoS em Server Actions; `sharp`/librsvg e `source-map-js` (altas) | **corrigido** — next 16.4.3 (16.4.4+ ainda com menos de 2 semanas), sharp 0.35.5, source-map-js 1.2.2; jest alinhado em 30.5.2 | `3aae635` | build + suíte |
| SEC-11 | P1 | `lib/password.ts` | Espelho da política sem o limite de 72 bytes do BCrypt | **corrigido** | `09c33b1` | `lib/__tests__/password.test.ts` |
| SEC-15 | P2 | `api-docs.json` | OpenAPI antigo versionado | **corrigido** — removido (sem dado sensível; só `localhost:8080`; não usado) | `1c08741` | — |
| SEC-18 | P2 | `next.config.ts`, cookies | Cabeçalhos e `secure` | já corrigido (CSP, HSTS em prod, `X-Frame-Options`, `nosniff`, `Permissions-Policy`; cookies `httpOnly` + `secure` em prod + `sameSite=lax`) | — | — |
| SEC-21 | P3 | `proxy.ts`, `lib/jwt.ts` | Role sem checar `exp` | já corrigido (`isTokenExpired` + renovação pelo refresh) | — | `lib/__tests__/jwt.test.ts` |
| SEC-22 | P3 | `next.config.ts`, `.gitignore` | Redirect "temporário" `/pagina-source`; arquivos gerados | **corrigido** o redirect; `.swc`/`tsbuildinfo` já ignorados e não versionados | `1c08741` | — |
| BUG-01 | — | `apiClient` | Texto puro no sucesso quebrava o parse | já corrigido | — | `apiClient.test.ts` |
| BUG-02 | — | `actions/auth.ts` | `trim` na senha | já corrigido (só e-mail); ida e volta coberta no backend | — | backend `AuthControllerIntegrationTest` |
| BUG-03 | — | `apiClient` | Erros por campo / 429 / status sem mensagem | já propagava `fieldErrors` e `Retry-After`; **corrigidos** 405/413/415/422/502/503/504 e status no sucesso sem corpo | `09c33b1` | `apiClient.test.ts` |
| BUG-04 | — | `apiClient`, `proxy.ts` | 401 sem limpar sessão | já corrigido (ADR 014) | — | `apiClient.test.ts` |
| BUG-07c | — | datas | `new Date(string)` sem offset | **parcial** — o backend devolve `LocalDateTime` (hora de Brasília, TZ do container); o navegador interpreta como hora local e mostra a mesma hora de parede, correto para quem está no fuso de Brasília. Usuário em outro fuso vê o horário de Brasília sem indicação — **pendente** rotular "horário de Brasília" ou migrar para `OffsetDateTime` (decisão de produto) | — | `lib/__tests__/calendar.test.ts` |
| BUG-07h | — | `CreateAppointmentModal` | Duplo clique, estados de carregamento | botões já travam durante o envio (convenção do projeto); limites de duração/antecedência agora são do backend (erro por campo) | — | — |
| BUG-10 | — | login | Cookie × JWT, autocomplete | já corrigido (expirações vêm da API; `autocomplete` email/current-password/new-password) | — | — |
| BUG-11 | — | vários | Lint, `any`, `catch {}` silencioso, ref no render | **corrigido**: aspas JSX, `any`, `displayName`, ref do `SessionNoteEditor` em `useLayoutEffect`, log no erro de conexão do `apiClient`. **Pendente:** `react-hooks/set-state-in-effect` (regra nova do eslint-config-next 16.4) rebaixada a aviso — 9 ocorrências em hooks/modais que buscam dados no `useEffect`; reescrever exige teste de interface | `cfccd68`, `09c33b1` | suíte |

## Pendências e riscos residuais
- 3 vulnerabilidades **moderadas** só em ferramentas de desenvolvimento (`deepmerge`, `glob`, `minimatch`), sem
  impacto em produção; a correção exige `npm audit fix --force` (versões incompatíveis). Revisar na próxima
  atualização de toolchain.
- Migrar os `useEffect` de busca de dados (regra `set-state-in-effect`) e então voltar a regra para erro.
- Rotular horários como "horário de Brasília" (BUG-07c).
- Desde a `feat/call` o cadastro pede o consentimento de dados de saúde também ao psicólogo, mas o backend só o
  registra/exige para paciente (ver relatório do backend); o `CLAUDE.md` (seção Legal) ainda diz "para paciente".
