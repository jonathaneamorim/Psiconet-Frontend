# Videochamada integrada (Sala Psiconet)

Decisões: ADR 016 do backend e [ADR 003](../decisoes/003-videochamada-livekit.md) do front.

## Agendamento — `MeetingProviderSelector`
`src/components/Molecules/MeetingProviderSelector.tsx`, usado pelo `CreateAppointmentModal` quando a
modalidade é **Online** (consulta única **e** recorrente).

| Prop | Uso |
|---|---|
| `value` / `onChange` | `'IN_APP'` (Sala Psiconet) ou `'EXTERNAL_LINK'` |
| `inAppAvailable` | resultado de `getVideoConfigAction()` (flag do backend). `false` ⇒ só o campo de link |
| `meetingLink` / `onMeetingLinkChange` / `linkError` | campo do link externo (texto livre com `inputMode="url"`) |

- A Sala Psiconet é o **padrão** quando disponível; não envia `meetingLink`.
- No link externo, `validateExternalMeetingLink` (`lib/meetingLink.ts`) aplica a mesma regra do backend
  (só http/https, sem credenciais/espaços, ≤ 255; sem esquema ⇒ `https://`).
- O DTO enviado leva `meetingProvider` (`AppointmentCreateDTO` e `RecurrenceRuleCreateDTO`).

## Botão "Entrar na chamada" — `JoinCallButton`
`src/components/Molecules/JoinCallButton.tsx` — usado em `AppointmentCard`, `AppointmentDetailsModal`,
`PatientAgendaView` e nos dashboards de psicólogo e paciente.
- **Sala Psiconet:** estado por `getJoinState` (`lib/videoCall.ts`) a partir de `joinOpensAt`/`joinClosesAt`
  **do servidor**: "Disponível às HH:mm" (desabilitado; contagem regressiva na última hora) → link para
  `/call/{id}` → "Sala encerrada". Atualiza sozinho (1 s perto da abertura, 30 s no resto).
- **Link externo:** `toSafeExternalUrl` (único utilitário; substituiu a lógica `startsWith('http')` que estava
  duplicada) e `target="_blank" rel="noopener noreferrer"`. Link inseguro não é renderizado.
- `MeetingTypeBadge` recebe `provider` e mostra "Vídeo integrado" ou "Link externo".

## Página da chamada — `/call/[appointmentId]`
`src/app/(pages)/call/[appointmentId]/page.tsx` (servidor) busca a consulta (`GET /appointments/{id}`) e, para
o psicólogo, o vínculo (link do prontuário). Renderiza `CallLoader` → `CallExperience` (dinâmico, só cliente):

1. **Lobby** (`CallLobby`): pede câmera/microfone (mensagens específicas para permissão negada, dispositivo
   ausente ou em uso), prévia espelhada da câmera, medidor do microfone, escolha de dispositivos, ligar/desligar
   antes de entrar e o aviso **"esta sessão não é gravada pela Psiconet; use um local privado"**.
2. **Entrar:** `joinVideoCallAction` — erros por `code` do backend (`videoJoinErrorMessage`): janela
   (`VIDEO_WINDOW_NOT_OPEN`/`CLOSED`, com o horário), consulta inativa, 404/403, 429 (tempo de espera), 503.
3. **Sala** (`CallRoom`): vídeo da outra pessoa + miniatura própria (retrato no celular, paisagem no desktop),
   mudo, câmera, dispositivos (microfone, câmera e alto-falante quando o navegador permite), tela cheia,
   indicador de qualidade (barras com rótulo acessível), faixa de reconexão, estados "Aguardando o psicólogo /
   paciente entrar…", "X saiu da sessão" e sair com confirmação (psicólogo também "Encerrar para todos").
4. **Fim:** "Você saiu" (pode entrar de novo), "Sessão encerrada", "aberta em outro lugar", "Você foi
   desconectado" (sozinho além do limite) ou "Conexão perdida".

**Sozinho na sala** (ADR 016 do backend): esperando a outra pessoa ou depois que ela saiu, a sala mostra
"Se ninguém entrar em 15 minutos, você será desconectado automaticamente"; nos 2 últimos minutos aparece a
contagem regressiva e, ao fim, a página desconecta. O limite vem do backend (`aloneTimeoutSeconds` na
credencial) e o backend também remove pelo provedor quem passar dele (desconexão `PARTICIPANT_REMOVED` ⇒
mesma tela). Quando todos saem, a sala fecha em segundos; entrar de novo (dentro da janela) a reabre.

**Limite de horário:** a credencial traz `hardStopAt` (fim da consulta + 60 min por padrão). Nos 5 últimos
minutos a sala avisa "a sala será encerrada às HH:mm"; no horário, a página sai e mostra "Horário da sessão
encerrado" (sem "Entrar novamente": a janela de entrada já fechou). O backend encerra a sala 1 min depois,
para todos, se ainda houver alguém.

**Permissão de câmera/microfone** (`MediaPermissionHelp` + `useMediaPermissions` + `lib/mediaPermission.ts`),
no lobby e na sala: ao ligar um dispositivo sem permissão, aparece "Permita o acesso à câmera/ao microfone".
Nenhum navegador deixa o site abrir as configurações de permissão, então:
- ainda não decidido (`prompt`): "Permitir acesso" refaz o pedido e o **próprio navegador mostra o aviso**;
- bloqueado (`denied`): passos do navegador em uso (Chrome/Edge, Firefox, Safari), "Já permiti, tentar de novo" e
  "Recarregar a página". Onde a Permissions API informa mudanças, o dispositivo **liga sozinho** ao ser liberado;
- permitido no navegador, mas bloqueado pelo sistema operacional: mensagem apontando as configurações de
  privacidade do Windows/macOS (evita repetir o pedido em loop).
O elemento HTML `<usermedia>` (pedido nativo a partir da página) ainda está em padronização e só existe no Chrome
recente — candidato a melhoria progressiva no futuro.

Layout: a página usa a mesma moldura das demais (`min-h-screen`, `pt-24 sm:pt-28` para a navbar fixa); a sala
ocupa a altura da tela menos essa moldura, e o footer fica sempre abaixo da dobra.

Acessibilidade: controles em `role="toolbar"` com rótulos (texto visível a partir de `sm`), `aria-pressed`
nos toggles, mensagens de estado em `aria-live`, confirmação em `ModalShell` (Esc fecha, foco no painel).

## Configuração
- Backend: `VIDEO_ENABLED`, `VIDEO_URL`, `VIDEO_API_KEY`, `VIDEO_API_SECRET` (+ janelas/lembrete) — ver
  `.env.example` do backend.
- Front: `VIDEO_CSP_ORIGINS` (lida no build/start), ex.: `wss://*.livekit.cloud https://*.livekit.cloud`;
  em desenvolvimento com LiveKit local, `ws://localhost:7880 http://localhost:7880`.

## Roteiro de teste manual (dois navegadores/perfis)
1. Psicólogo (perfil A) agenda consulta **Online → Sala Psiconet** para daqui a ~12 min (e uma recorrente).
2. Paciente (perfil B, outro navegador): a agenda mostra "Disponível às HH:mm"; ao abrir a janela o botão
   habilita sozinho. Entrar ⇒ lobby ⇒ "Aguardando o psicólogo entrar…"; notificação quando ele entrar.
3. Psicólogo entra; conferir vídeo/áudio nos dois sentidos, mudo, câmera, troca de dispositivo, tela cheia.
4. **Permissão:** (a) primeira visita, recusar o pedido ⇒ aviso com "Permitir acesso", que reabre o pedido do
   navegador; (b) bloquear a câmera nas configurações do site e clicar em "Câmera desligada" ⇒ passos do navegador;
   liberar pelo cadeado ⇒ a câmera liga sem recarregar (Chrome/Edge/Firefox); (c) o mesmo dentro da sala, pelo
   botão de câmera; (d) "Continuar sem câmera" ⇒ entra só com áudio.
5. **Rede:** desligar o Wi-Fi por ~10 s ⇒ faixa "reconectando…" e retorno; por ~60 s ⇒ nova entrada automática
   ou "Conexão perdida" com "Entrar novamente".
6. **Saída e reentrada:** paciente sai ⇒ psicólogo vê "saiu da sessão"; paciente reentra.
7. Abrir a mesma consulta em outra aba do paciente ⇒ a primeira mostra "aberta em outro lugar".
8. Psicólogo "Encerrar para todos" ⇒ paciente vê "Sessão encerrada".
8b. **Sozinho:** com `VIDEO_ALONE_TIMEOUT=3m` no backend, entrar sozinho ⇒ aviso com contagem no último
    minuto… e desconexão com "Você foi desconectado"; "Entrar novamente" reabre a sala. Os dois saem ⇒ a sala
    some do LiveKit em ~5 s (`docker logs psiconet_livekit`).
9. Terceiro usuário abrindo `/call/{id}` ⇒ "Consulta não encontrada"; consulta cancelada ⇒ sem botão.
10. **Celular** (Android Chrome e iOS Safari), retrato e paisagem: layout, miniatura, botões e áudio pelo alto-falante.
11. Desligar `VIDEO_ENABLED` no backend ⇒ opção some do agendamento; link externo continua funcionando.
