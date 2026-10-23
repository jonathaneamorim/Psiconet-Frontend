import type { AppointmentDTO } from '@/types/appointment';

/**
 * Estado do botão "Entrar na chamada" da Sala Psiconet. A janela (joinOpensAt/joinClosesAt) vem do
 * backend — o front só a exibe; quem barra entrada fora dela é sempre o backend. Os horários são
 * LocalDateTime sem fuso (horário de Brasília, como o resto da agenda).
 */
export type JoinState =
  | { kind: 'not-in-app' }
  | { kind: 'unavailable' }
  | { kind: 'upcoming'; opensAt: Date; msUntilOpen: number }
  | { kind: 'open'; closesAt: Date }
  | { kind: 'closed' };

export function isInAppVideo(appointment: Pick<AppointmentDTO, 'meetingType' | 'meetingProvider'>): boolean {
  return appointment.meetingType === 'VIDEO_CALL' && appointment.meetingProvider === 'IN_APP';
}

export function getJoinState(
  appointment: Pick<AppointmentDTO, 'meetingType' | 'meetingProvider' | 'status' | 'joinOpensAt' | 'joinClosesAt'>,
  now: Date = new Date()
): JoinState {
  if (!isInAppVideo(appointment)) return { kind: 'not-in-app' };
  if (appointment.status !== 'ACCEPTED' && appointment.status !== 'COMPLETED') return { kind: 'unavailable' };
  if (!appointment.joinOpensAt || !appointment.joinClosesAt) return { kind: 'unavailable' };

  const opensAt = new Date(appointment.joinOpensAt);
  const closesAt = new Date(appointment.joinClosesAt);
  if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime())) return { kind: 'unavailable' };

  if (now < opensAt) return { kind: 'upcoming', opensAt, msUntilOpen: opensAt.getTime() - now.getTime() };
  if (now > closesAt) return { kind: 'closed' };
  return { kind: 'open', closesAt };
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/** "às 14:50" no mesmo dia; "em 24/10 às 14:50" em outro dia. */
export function formatOpensAt(opensAt: Date, now: Date = new Date()): string {
  const sameDay = opensAt.toDateString() === now.toDateString();
  return sameDay
    ? `às ${timeFormatter.format(opensAt)}`
    : `em ${dayFormatter.format(opensAt)} às ${timeFormatter.format(opensAt)}`;
}

/** Contagem regressiva curta ("4 min 05 s", "1 h 20 min"). */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  if (minutes > 0) return `${minutes} min ${String(seconds).padStart(2, '0')} s`;
  return `${seconds} s`;
}

/** Mensagens das recusas de entrada (códigos estáveis do backend, ADR 016). */
export function videoJoinErrorMessage(result: { status?: number; code?: string; error?: string; retryAfter?: number }): string {
  switch (result.code) {
    case 'VIDEO_WINDOW_NOT_OPEN':
    case 'VIDEO_WINDOW_CLOSED':
    case 'VIDEO_APPOINTMENT_INACTIVE':
    case 'VIDEO_NOT_IN_APP':
      return result.error ?? 'Não é possível entrar nesta sessão agora.';
    case 'VIDEO_UNAVAILABLE':
      return 'A videochamada está indisponível no momento. Tente novamente em instantes.';
    case 'RATE_LIMITED':
      return result.retryAfter
        ? `Muitas tentativas de entrada. Aguarde ${Math.ceil(result.retryAfter / 60)} min e tente novamente.`
        : 'Muitas tentativas de entrada. Aguarde um pouco e tente novamente.';
  }
  if (result.status === 404 || result.status === 403) return 'Consulta não encontrada ou você não participa dela.';
  return result.error ?? 'Não foi possível entrar na sala. Tente novamente.';
}

/** Explicação amigável para falhas de câmera/microfone (getUserMedia). */
export function mediaErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'O navegador bloqueou o acesso à câmera ou ao microfone. Clique no ícone de cadeado ao lado do endereço do site, permita câmera e microfone e recarregue a página.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'Não encontramos câmera ou microfone. Verifique se estão conectados ou escolha outro dispositivo.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'A câmera ou o microfone está em uso por outro aplicativo (ex.: outra chamada). Feche-o e tente novamente.';
    default:
      return 'Não foi possível acessar a câmera ou o microfone. Verifique as permissões do navegador.';
  }
}
