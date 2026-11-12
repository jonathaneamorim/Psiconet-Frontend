'use client';

import type { MeetingProvider } from '@/types/appointment';
import { MEETING_LINK_MAX_LENGTH } from '@/lib/meetingLink';

interface Props {
  value: MeetingProvider;
  onChange: (provider: MeetingProvider) => void;
  /** Sala Psiconet disponível (feature flag do backend). Indisponível ⇒ só o link externo aparece. */
  inAppAvailable: boolean;
  meetingLink: string;
  onMeetingLinkChange: (link: string) => void;
  linkError?: string | null;
}

const OPTIONS: { value: MeetingProvider; title: string; description: string }[] = [
  {
    value: 'IN_APP',
    title: 'Sala Psiconet',
    description: 'Vídeo integrado, sem link. Abre alguns minutos antes da sessão.',
  },
  {
    value: 'EXTERNAL_LINK',
    title: 'Link externo',
    description: 'Google Meet, Zoom ou outro serviço.',
  },
];

/**
 * Escolha de como a consulta online acontece (agendamento único e recorrente). A Sala Psiconet é o
 * padrão quando disponível; o link externo mantém o campo de link com a mesma validação do backend.
 */
export function MeetingProviderSelector({
  value,
  onChange,
  inAppAvailable,
  meetingLink,
  onMeetingLinkChange,
  linkError,
}: Props) {
  const options = inAppAvailable ? OPTIONS : OPTIONS.filter((o) => o.value === 'EXTERNAL_LINK');
  const effective: MeetingProvider = inAppAvailable ? value : 'EXTERNAL_LINK';

  return (
    <div className="flex flex-col gap-3">
      {options.length > 1 && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-xs font-semibold text-slate-700 mb-1.5">
            Como será a chamada? <span className="text-red-500">*</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((option) => {
              const selected = effective === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-indigo-500/40 ${selected
                    ? 'bg-indigo-50 border-indigo-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <input
                    type="radio"
                    name="meetingProvider"
                    value={option.value}
                    checked={selected}
                    onChange={() => onChange(option.value)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold ${selected ? 'text-indigo-800' : 'text-slate-700'}`}>
                      {option.title}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-snug">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {effective === 'IN_APP' ? (
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
          Psicólogo e paciente entram pelo botão <strong>Entrar na chamada</strong> na agenda. A Psiconet{' '}
          <strong>não grava</strong> as sessões.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meetingLink" className="text-xs font-semibold text-slate-700">
            Link da Videochamada <span className="text-red-500">*</span>
          </label>
          <input
            id="meetingLink"
            // type="text": o navegador recusaria "meet.google.com/x" sem esquema; a validação (igual à do
            // backend) completa https:// e barra esquemas perigosos.
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={meetingLink}
            maxLength={MEETING_LINK_MAX_LENGTH}
            onChange={(e) => onMeetingLinkChange(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij ou link do Zoom"
            aria-invalid={Boolean(linkError)}
            aria-describedby={linkError ? 'meetingLink-error' : undefined}
            className={`w-full text-xs p-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all ${linkError
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
          />
          {linkError && (
            <span id="meetingLink-error" role="alert" className="text-[11px] font-medium text-red-500">
              {linkError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
