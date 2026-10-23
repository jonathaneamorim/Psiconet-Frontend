'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaDevices, usePreviewTracks, useTrackVolume } from '@livekit/components-react';
import { Track, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
import type { AppointmentDTO } from '@/types/appointment';
import { formatAppointmentDate, formatAppointmentTime } from '@/lib/calendar';
import { mediaErrorMessage } from '@/lib/videoCall';

export interface DeviceChoices {
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}

interface Props {
  appointment: AppointmentDTO;
  isHost: boolean;
  otherName: string;
  error?: string;
  agendaHref: string;
  onJoin: (choices: DeviceChoices) => Promise<void>;
}

/**
 * Pré-entrada: pede câmera/microfone com explicação em caso de bloqueio, permite escolher e testar os
 * dispositivos (prévia da câmera e medidor do microfone) e lembra que a sessão não é gravada.
 */
export function CallLobby({ appointment, isHost, otherName, error, agendaHref, onJoin }: Props) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
  const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const options = useMemo(() => ({
    audio: audioEnabled ? { deviceId: audioDeviceId } : false,
    video: videoEnabled ? { deviceId: videoDeviceId } : false,
  }), [audioEnabled, audioDeviceId, videoEnabled, videoDeviceId]);

  const handleMediaError = useCallback((err: Error) => setMediaError(mediaErrorMessage(err)), []);
  const tracks = usePreviewTracks(options, handleMediaError);
  const videoTrack = tracks?.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined;
  const audioTrack = tracks?.find((t) => t.kind === Track.Kind.Audio) as LocalAudioTrack | undefined;
  const micLevel = useTrackVolume(audioTrack);

  const cameras = useMediaDevices({ kind: 'videoinput' });
  const microphones = useMediaDevices({ kind: 'audioinput' });

  useEffect(() => {
    const element = videoRef.current;
    if (!videoTrack || !element) return;
    videoTrack.attach(element);
    return () => {
      videoTrack.detach(element);
    };
  }, [videoTrack]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await onJoin({ audioEnabled, videoEnabled, audioDeviceId, videoDeviceId });
    } finally {
      setJoining(false);
    }
  };

  const toggleClass = (on: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${on
      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden shadow-md">
          {videoEnabled && videoTrack ? (
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover -scale-x-100"
              aria-label="Prévia da sua câmera"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">
              {videoEnabled ? 'Iniciando a câmera…' : 'Câmera desligada'}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={audioEnabled} onClick={() => setAudioEnabled((v) => !v)} className={toggleClass(audioEnabled)}>
            {audioEnabled ? 'Microfone ligado' : 'Microfone desligado'}
          </button>
          <button type="button" aria-pressed={videoEnabled} onClick={() => setVideoEnabled((v) => !v)} className={toggleClass(videoEnabled)}>
            {videoEnabled ? 'Câmera ligada' : 'Câmera desligada'}
          </button>
          {audioEnabled && audioTrack && (
            <div className="flex items-center gap-2 ml-auto text-[11px] text-slate-500">
              <span id="mic-level-label">Teste do microfone</span>
              <div
                role="meter"
                aria-labelledby="mic-level-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(micLevel * 100)}
                className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden"
              >
                <div className="h-full bg-emerald-500 transition-[width] duration-100" style={{ width: `${Math.min(100, micLevel * 300)}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            Câmera
            <select
              value={videoDeviceId ?? ''}
              onChange={(e) => setVideoDeviceId(e.target.value || undefined)}
              disabled={!videoEnabled || cameras.length === 0}
              className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium disabled:bg-slate-100"
            >
              <option value="">Padrão do sistema</option>
              {cameras.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Câmera ${i + 1}`}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            Microfone
            <select
              value={audioDeviceId ?? ''}
              onChange={(e) => setAudioDeviceId(e.target.value || undefined)}
              disabled={!audioEnabled || microphones.length === 0}
              className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium disabled:bg-slate-100"
            >
              <option value="">Padrão do sistema</option>
              {microphones.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Microfone ${i + 1}`}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Sala Psiconet</p>
          <h2 className="text-lg font-bold text-slate-800 mt-1">Sessão com {otherName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatAppointmentDate(appointment.startDateTime)} • {formatAppointmentTime(appointment.startDateTime, appointment.endDateTime)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Esta sessão não é gravada pela Psiconet.</strong> Use um local privado e, se possível, fones de ouvido.
          Não grave a sessão sem o consentimento da outra pessoa.
        </div>

        {!isHost && (
          <p className="text-xs text-slate-500">
            Se o psicólogo ainda não tiver chegado, você aguardará na sala até ele entrar.
          </p>
        )}

        {mediaError && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{mediaError}</p>
        )}
        {error && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="w-full px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {joining ? 'Entrando…' : 'Entrar na sala'}
          </button>
          <Link href={agendaHref} className="text-center text-xs font-semibold text-slate-500 hover:text-slate-700 py-1.5">
            Voltar para a agenda
          </Link>
        </div>
      </div>
    </div>
  );
}
