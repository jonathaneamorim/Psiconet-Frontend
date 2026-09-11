import { BillingSettingsForm } from '@/components/Organism/BillingSettingsForm';
import { ProfileSettingsForm } from '@/components/Organism/ProfileSettingsForm';
import { NotificationPreferencesForm } from '@/components/Organism/NotificationPreferencesForm';
import { getMyPsychologistProfileAction } from '@/actions/profile';
import { getNotificationPreferencesAction } from '@/actions/notifications';

export const metadata = {
  title: 'Configurações | Psiconet',
  description: 'Gerencie as configurações de cobrança da sua conta.',
};

const DEFAULT_PREFERENCES = { appointmentEnabled: true, connectionEnabled: true, paymentEnabled: true };

export default async function PsychologistSettingsPage() {
  const [profileResult, preferencesResult] = await Promise.all([
    getMyPsychologistProfileAction(),
    getNotificationPreferencesAction(),
  ]);

  const profile = profileResult.data;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-600">Gerencie as preferências da sua conta na plataforma.</p>
        </div>

        {profile && (
          <ProfileSettingsForm
            initial={{
              fullName: profile.fullName,
              phone: profile.phone,
              description: profile.description,
              photoUrl: profile.photoUrl,
              officeAddress: profile.officeAddress,
            }}
          />
        )}

        <BillingSettingsForm
          initial={{
            pixKey: profile?.pixKey,
            paymentTiming: profile?.paymentTiming,
            paymentAdvanceValue: profile?.paymentAdvanceValue,
            paymentAdvanceUnit: profile?.paymentAdvanceUnit,
          }}
        />

        <NotificationPreferencesForm initial={preferencesResult.data ?? DEFAULT_PREFERENCES} />
      </div>
    </div>
  );
}
