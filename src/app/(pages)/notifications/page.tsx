import { getNotificationsAction } from '@/actions/notifications';
import { NotificationsPageView } from '@/components/Organism/NotificationsPageView';
import { getUserRole } from '@/lib/auth';

export const metadata = {
  title: 'Notificações | Psiconet',
  description: 'Visualize e gerencie todas as suas notificações de consultas, conexões e cobranças.',
};

export default async function NotificationsPage() {
  const [notifications, role] = await Promise.all([getNotificationsAction(), getUserRole()]);

  return <NotificationsPageView initialNotifications={notifications} role={role} />;
}
