import { resolveNotificationRoute } from '@/lib/notificationRoutes';
import { RoleEnum } from '@/enums/RoleEnum';

describe('resolveNotificationRoute', () => {
  it('leva o usuário ao detalhe do chamado e o admin à tela admin', () => {
    expect(resolveNotificationRoute({ referenceType: 'TICKET', referenceId: 'abc' }, RoleEnum.PATIENT)).toBe('/support/abc');
    expect(resolveNotificationRoute({ referenceType: 'TICKET', referenceId: 'abc' }, RoleEnum.ADMIN)).toBe('/admin/tickets/abc');
  });

  it('prontuário depende da role', () => {
    expect(resolveNotificationRoute({ referenceType: 'MEDICAL_RECORD' }, RoleEnum.PSYCHOLOGIST)).toContain('/psychologist/medical-records');
    expect(resolveNotificationRoute({ referenceType: 'MEDICAL_RECORD' }, RoleEnum.PATIENT)).toBe('/patient/medical-records');
  });

  it('comunicado fica na central de notificações', () => {
    expect(resolveNotificationRoute({ referenceType: 'ANNOUNCEMENT' }, RoleEnum.PATIENT)).toBeNull();
  });

  it('mantém as rotas existentes', () => {
    expect(resolveNotificationRoute({ referenceType: 'PAYMENT' }, RoleEnum.PATIENT)).toBe('/patient/payments');
  });
});
