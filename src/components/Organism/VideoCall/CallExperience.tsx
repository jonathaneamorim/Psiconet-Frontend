'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import type { AppointmentDTO } from '@/types/appointment';
import type { VideoJoinResponseDTO } from '@/types/video';
import { joinVideoCallAction } from '@/actions/video';
import { videoJoinErrorMessage } from '@/lib/videoCall';
import { CallLobby, type DeviceChoices } from './CallLobby';
import { CallRoom, type CallEndReason } from './CallRoom';

export interface CallExperienceProps {
  appointment: AppointmentDTO;
  isHost: boolean;
  agendaHref: string;
  recordHref?: string;
}

type Phase =
  | { name: 'lobby'; error?: string }
  | { name: 'room'; credentials: VideoJoinResponseDTO; choices: DeviceChoices }
  | { name: 'finished'; reason: CallEndReason };

// Novas entradas automáticas seguidas após quedas longas, antes de desistir e mostrar "Conexão perdida".
const MAX_AUTO_REJOINS = 3;

const FINISHED_TEXT: Record<CallEndReason, { title: string; body: string }> = {
  left: { title: 'Você saiu da sessão', body: 'Se saiu sem querer, é possível entrar novamente enquanto a sala estiver aberta.' },
  ended: { title: 'Sessão encerrada', body: 'O psicólogo encerrou a sessão. Obrigado por usar a Psiconet.' },
  'other-device': { title: 'Sessão aberta em outro lugar', body: 'Você entrou nesta sessão por outra aba ou dispositivo, então esta janela foi desconectada.' },
  failed: { title: 'Conexão perdida', body: 'Não conseguimos reconectar à sala. Verifique sua internet e tente entrar novamente.' },
};

/**
 * Fluxo da chamada: lobby (permissões, dispositivos, prévia) → sala → fim.
 * A credencial da sala é buscada por Server Action ao clicar em "Entrar" e fica só em memória
 * (estado do React); nunca vai para storage ou URL. Cada nova entrada pede uma credencial nova.
 */
export function CallExperience({ appointment, isHost, agendaHref, recordHref }: CallExperienceProps) {
  const [phase, setPhase] = useState<Phase>({ name: 'lobby' });
  const [lastChoices, setLastChoices] = useState<DeviceChoices | null>(null);
  const rejoinAttempts = useRef(0);

  const requestCredentials = useCallback(async (choices: DeviceChoices): Promise<string | null> => {
    const result = await joinVideoCallAction(appointment.id);
    if (!result.data) return videoJoinErrorMessage(result);
    setLastChoices(choices);
    setPhase({ name: 'room', credentials: result.data, choices });
    return null;
  }, [appointment.id]);

  const handleJoin = async (choices: DeviceChoices) => {
    const error = await requestCredentials(choices);
    if (error) setPhase({ name: 'lobby', error });
  };

  // Reconexão completa (após queda longa): nova credencial, mesmas escolhas de dispositivo.
  const handleRejoin = useCallback(async () => {
    if (!lastChoices || rejoinAttempts.current >= MAX_AUTO_REJOINS) return 'Não foi possível reconectar.';
    rejoinAttempts.current += 1;
    return requestCredentials(lastChoices);
  }, [lastChoices, requestCredentials]);

  const otherName = isHost ? appointment.patient.fullName : appointment.psychologist.fullName;

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8" aria-labelledby="call-title">
      <h1 id="call-title" className="sr-only">Sessão online com {otherName}</h1>

      {phase.name === 'lobby' && (
        <CallLobby
          appointment={appointment}
          isHost={isHost}
          otherName={otherName}
          error={phase.error}
          onJoin={handleJoin}
          agendaHref={agendaHref}
        />
      )}

      {phase.name === 'room' && (
        <CallRoom
          key={phase.credentials.token}
          credentials={phase.credentials}
          choices={phase.choices}
          isHost={isHost}
          otherName={otherName}
          recordHref={recordHref}
          onRejoin={handleRejoin}
          onConnected={() => {
            rejoinAttempts.current = 0;
          }}
          onFinished={(reason) => setPhase({ name: 'finished', reason })}
        />
      )}

      {phase.name === 'finished' && (
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 text-center flex flex-col items-center gap-4" role="status">
          <h2 className="text-lg font-bold text-slate-800">{FINISHED_TEXT[phase.reason].title}</h2>
          <p className="text-sm text-slate-500">{FINISHED_TEXT[phase.reason].body}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {phase.reason !== 'ended' && (
              <button
                type="button"
                onClick={() => setPhase({ name: 'lobby' })}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                Entrar novamente
              </button>
            )}
            <Link href={agendaHref} className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
              Voltar para a agenda
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
