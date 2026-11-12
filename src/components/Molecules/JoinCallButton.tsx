'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AppointmentDTO } from '@/types/appointment';
import { toSafeExternalUrl } from '@/lib/meetingLink';
import { formatCountdown, formatOpensAt, getJoinState } from '@/lib/videoCall';
import { ROUTES } from '@/config/routes';

interface Props {
  appointment: AppointmentDTO;
  /** "inline": botão compacto (cards, listas); "block": largura total em telas pequenas (modais, destaque). */
  variant?: 'inline' | 'block';
}

const VideoIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

// Contagem regressiva só na última hora; antes disso basta o horário de abertura.
const COUNTDOWN_THRESHOLD_MS = 60 * 60 * 1000;

/**
 * "Entrar na chamada" para consultas online.
 * - Sala Psiconet: habilitado só dentro da janela devolvida pelo backend; fora dela mostra
 *   "Disponível às HH:mm" (com contagem regressiva na última hora). O backend é quem barra de fato.
 * - Link externo: abre em nova aba com rel="noopener noreferrer"; links inseguros não são renderizados.
 */
export function JoinCallButton({ appointment, variant = 'inline' }: Props) {
  const [now, setNow] = useState(() => new Date());
  const state = getJoinState(appointment, now);
  const ticking = state.kind === 'upcoming' || state.kind === 'open';
  const fast = state.kind === 'upcoming' && state.msUntilOpen <= COUNTDOWN_THRESHOLD_MS;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setNow(new Date()), fast ? 1000 : 30_000);
    return () => window.clearInterval(id);
  }, [ticking, fast]);

  const width = variant === 'block' ? 'w-full sm:w-auto' : '';
  const base = `inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${width}`;
  const enabled = `${base} text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`;

  if (appointment.meetingType !== 'VIDEO_CALL') return null;

  if (state.kind === 'not-in-app') {
    if (appointment.status !== 'ACCEPTED') return null;
    const href = toSafeExternalUrl(appointment.meetingLink);
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={enabled}>
        <VideoIcon />
        Entrar na chamada
        <span className="sr-only">(abre o link externo em nova aba)</span>
      </a>
    );
  }

  if (state.kind === 'open') {
    return (
      <Link href={`${ROUTES.CALL}/${appointment.id}`} className={enabled}>
        <VideoIcon />
        Entrar na chamada
      </Link>
    );
  }

  if (state.kind === 'upcoming') {
    return (
      <div className={`flex flex-col items-stretch gap-1 ${width}`}>
        <button type="button" disabled aria-disabled="true" className={`${base} text-indigo-400 bg-indigo-50 border border-indigo-100 cursor-not-allowed`}>
          <VideoIcon />
          Disponível {formatOpensAt(state.opensAt, now)}
        </button>
        {fast && (
          <span className="text-[11px] text-slate-500 text-center" aria-live="off">
            Abre em {formatCountdown(state.msUntilOpen)}
          </span>
        )}
      </div>
    );
  }

  // Encerrada ou indisponível (cancelada, sem janela): nada a fazer.
  if (state.kind === 'closed' && appointment.status !== 'CANCELLED') {
    return <span className="text-[11px] font-medium text-slate-400">Sala encerrada</span>;
  }
  return null;
}
