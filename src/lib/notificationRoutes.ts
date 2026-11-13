import { RoleEnum } from '@/enums/RoleEnum';
import type { NotificationDTO } from '@/types/notification';

/**
 * Destino do clique em uma notificação, a partir de referenceType/referenceId e da role.
 * Comunicados do administrador não têm página própria: ficam na central de notificações.
 */
export function resolveNotificationRoute(
  notification: Pick<NotificationDTO, 'referenceType' | 'referenceId' | 'type'>,
  role: RoleEnum | null
): string | null {
  if (!role) return null;
  const { referenceType, referenceId, type } = notification;

  // Lembrete / psicólogo entrou: direto para a sala da consulta (o backend valida acesso e janela).
  if ((type === 'VIDEO_SESSION_REMINDER' || type === 'VIDEO_PARTICIPANT_JOINED') && referenceId
      && (role === RoleEnum.PATIENT || role === RoleEnum.PSYCHOLOGIST)) {
    return `/call/${referenceId}`;
  }

  // Sobreposição na agenda: abre a consulta na agenda do psicólogo (o dia dela fica selecionado).
  if (type === 'SCHEDULE_OVERLAP' && role === RoleEnum.PSYCHOLOGIST) {
    return referenceId ? `/psychologist/appointments?consulta=${encodeURIComponent(referenceId)}` : '/psychologist/appointments';
  }

  if (referenceType === 'TICKET') {
    if (role === RoleEnum.ADMIN) return referenceId ? `/admin/tickets/${referenceId}` : '/admin/tickets';
    return referenceId ? `/support/${referenceId}` : '/support';
  }

  // Nova versão de Termos/Privacidade: tela de aceite (se já aceitou, ela redireciona ao dashboard)
  if (referenceType === 'LEGAL') return '/accept-terms';

  if (referenceType === 'MEDICAL_RECORD') {
    if (role === RoleEnum.PSYCHOLOGIST) return '/psychologist/medical-records?aba=solicitacoes';
    if (role === RoleEnum.PATIENT) return '/patient/medical-records';
    return null;
  }

  if (role !== RoleEnum.PATIENT && role !== RoleEnum.PSYCHOLOGIST) return null;

  // Pedido de conexão: abre direto a aba de solicitações recebidas (aceitar/recusar).
  if (type === 'CONNECTION_REQUESTED') return `/${role}/connections?aba=recebidas#solicitacoes`;

  const routes: Record<string, string> = {
    APPOINTMENT: `/${role}/appointments`,
    CONNECTION: `/${role}/connections`,
    PAYMENT: `/${role}/payments`,
  };
  return routes[referenceType] ?? null;
}
