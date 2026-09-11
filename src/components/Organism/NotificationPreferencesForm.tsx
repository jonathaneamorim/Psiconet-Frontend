'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { NotificationPreferenceDTO } from '@/types/notification';
import { updateNotificationPreferencesAction } from '@/actions/notifications';

interface Props {
  initial: NotificationPreferenceDTO;
}

const OPTIONS: { key: keyof NotificationPreferenceDTO; label: string; description: string }[] = [
  {
    key: 'appointmentEnabled',
    label: 'Agendamentos',
    description: 'Consultas marcadas, aceitas ou canceladas.',
  },
  {
    key: 'connectionEnabled',
    label: 'Conexões',
    description: 'Solicitações de conexão recebidas ou aceitas.',
  },
  {
    key: 'paymentEnabled',
    label: 'Pagamentos',
    description: 'Comprovantes enviados, aprovados, rejeitados ou contestados.',
  },
];

export function NotificationPreferencesForm({ initial }: Props) {
  const [preferences, setPreferences] = useState(initial);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleToggle = async (key: keyof NotificationPreferenceDTO) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    setSavingKey(key);

    const result = await updateNotificationPreferencesAction(next);
    setSavingKey(null);

    if (result.error) {
      toast.error(result.error);
      setPreferences(preferences);
      return;
    }

    if (result.data) setPreferences(result.data);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-800">Notificações</h2>
        <p className="text-xs text-slate-500 mt-0.5">Escolha sobre o que você quer ser notificado na plataforma.</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50"
          >
            <div>
              <p className="text-xs font-semibold text-slate-800">{option.label}</p>
              <p className="text-[11px] text-slate-500">{option.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[option.key]}
              disabled={savingKey === option.key}
              onClick={() => handleToggle(option.key)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50 ${preferences[option.key] ? 'bg-[var(--primary)]' : 'bg-slate-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${preferences[option.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
