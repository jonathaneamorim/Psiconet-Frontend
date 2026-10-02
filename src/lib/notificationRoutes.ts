import { RoleEnum } from '@/enums/RoleEnum';
import type { NotificationDTO } from '@/types/notification';

/**
 * Destino do clique em uma notificação, a partir de referenceType/referenceId e da role.
 * Comunicados do administrador não têm página própria: ficam na central de notificações.
 */
export function resolveNotificationRoute(
  notification: Pick<NotificationDTO, 'referenceType' | 'referenceId'>,
  role: RoleEnum | null
): string | null {
  if (!role) return null;
  const { referenceType, referenceId } = notification;

  if (referenceType === 'TICKET') {
    if (role === RoleEnum.ADMIN) return referenceId ? `/admin/tickets/${referenceId}` : '/admin/tickets';
    return referenceId ? `/support/${referenceId}` : '/support';
  }

  if (referenceType === 'MEDICAL_RECORD') {
    if (role === RoleEnum.PSYCHOLOGIST) return '/psychologist/medical-records?aba=solicitacoes';
    if (role === RoleEnum.PATIENT) return '/patient/medical-records';
    return null;
  }

  if (role !== RoleEnum.PATIENT && role !== RoleEnum.PSYCHOLOGIST) return null;

  const routes: Record<string, string> = {
    APPOINTMENT: `/${role}/appointments`,
    CONNECTION: `/${role}/connections`,
    PAYMENT: `/${role}/payments`,
  };
  return routes[referenceType] ?? null;
}
