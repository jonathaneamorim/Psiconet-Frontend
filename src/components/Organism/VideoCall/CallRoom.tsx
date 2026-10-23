'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  isTrackReference,
  useConnectionQualityIndicator,
  useConnectionState,
  useLocalParticipant,
  useMediaDeviceSelect,
  useRemoteParticipants,
  useRoomContext,
  useTrackToggle,
  useTracks,
} from '@livekit/components-react';
import { ConnectionQuality, ConnectionState, DisconnectReason, Track, type RoomOptions } from 'livekit-client';
import { Maximize, Mic, MicOff, Minimize, PhoneOff, Settings, Video, VideoOff } from 'lucide-react';
import type { VideoJoinResponseDTO } from '@/types/video';
import { endVideoCallAction } from '@/actions/video';
import { ModalShell } from '@/components/Molecules/ModalShell';
import type { DeviceChoices } from './CallLobby';

export type CallEndReason = 'left' | 'ended' | 'other-device' | 'failed';

interface Props {
  credentials: VideoJoinResponseDTO;
  choices: DeviceChoices;
  isHost: boolean;
  otherName: string;
  recordHref?: string;
  /**
   * Queda longa (o SDK já reconecta sozinho as curtas): pede credencial nova e remonta a sala.
   * Devolve mensagem de erro quando não for possível (inclui o limite de tentativas automáticas).
   */
  onRejoin: () => Promise<string | null>;
  onConnected: () => void;
  onFinished: (reason: CallEndReason) => void;
}

const REJOIN_DELAY_MS = 2000;

/**
 * Sala: vídeo da outra pessoa + miniatura própria, controles, qualidade de conexão e reconexão.
 * Sessão 1:1 (o backend limita a sala a 2 participantes). Nada é gravado; não há chat nem
 * compartilhamento de tela nesta versão (ADR 016).
 */
export function CallRoom({ credentials, choices, isHost, otherName, recordHref, onRejoin, onConnected, onFinished }: Props) {
  const intentionalLeave = useRef(false);
  const [rejoining, setRejoining] = useState(false);

  const options = useMemo<RoomOptions>(() => ({
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: { deviceId: choices.videoDeviceId },
    audioCaptureDefaults: { deviceId: choices.audioDeviceId, echoCancellation: true, noiseSuppression: true },
  }), [choices.audioDeviceId, choices.videoDeviceId]);

  const handleDisconnected = useCallback(async (reason?: DisconnectReason) => {
    if (intentionalLeave.current || reason === DisconnectReason.CLIENT_INITIATED) return onFinished('left');
    if (reason === DisconnectReason.ROOM_DELETED) return onFinished('ended');
    if (reason === DisconnectReason.DUPLICATE_IDENTITY) return onFinished('other-device');

    // Queda de rede/servidor: tenta entrar de novo com credencial nova.
    setRejoining(true);
    await new Promise((resolve) => setTimeout(resolve, REJOIN_DELAY_MS));
    const error = await onRejoin();
    if (error) onFinished('failed');
  }, [onFinished, onRejoin]);

  return (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect
      audio={choices.audioEnabled}
      video={choices.videoEnabled}
      options={options}
      onDisconnected={handleDisconnected}
      onConnected={onConnected}
      className="contents"
    >
      <RoomStage
        credentials={credentials}
        isHost={isHost}
        otherName={otherName}
        recordHref={recordHref}
        rejoining={rejoining}
        onLeave={() => {
          intentionalLeave.current = true;
        }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

interface StageProps {
  credentials: VideoJoinResponseDTO;
  isHost: boolean;
  otherName: string;
  recordHref?: string;
  rejoining: boolean;
  onLeave: () => void;
}

const QUALITY: Record<ConnectionQuality, { label: string; bars: number; color: string }> = {
  [ConnectionQuality.Excellent]: { label: 'Conexão excelente', bars: 3, color: 'bg-emerald-400' },
  [ConnectionQuality.Good]: { label: 'Conexão boa', bars: 2, color: 'bg-amber-400' },
  [ConnectionQuality.Poor]: { label: 'Conexão fraca', bars: 1, color: 'bg-red-400' },
  [ConnectionQuality.Lost]: { label: 'Conexão perdida', bars: 0, color: 'bg-red-500' },
  [ConnectionQuality.Unknown]: { label: 'Medindo a conexão', bars: 0, color: 'bg-slate-400' },
};

function RoomStage({ credentials, isHost, otherName, recordHref, rejoining, onLeave }: StageProps) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const remotes = useRemoteParticipants();
  const remote = remotes.find((p) => p.identity === credentials.remoteIdentity);
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  const localRef = cameraTracks.find((t) => t.participant.isLocal);
  const remoteRef = remote ? cameraTracks.find((t) => t.participant.identity === remote.identity) : undefined;
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });

  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const camera = useTrackToggle({ source: Track.Source.Camera });

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [ending, setEnding] = useState(false);

  // "O outro participante saiu" só depois de ele ter estado na sala ao menos uma vez.
  const [remoteSeen, setRemoteSeen] = useState(false);
  if (remote && !remoteSeen) setRemoteSeen(true);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {
      // Tela cheia indisponível (ex.: iOS em navegador embutido): segue normal.
    }
  };

  const leave = async (endForAll: boolean) => {
    onLeave();
    if (endForAll) {
      setEnding(true);
      await endVideoCallAction(credentials.appointmentId);
    }
    await room.disconnect();
  };

  const reconnecting = rejoining
    || connectionState === ConnectionState.Reconnecting
    || connectionState === ConnectionState.SignalReconnecting;
  const connecting = connectionState === ConnectionState.Connecting && !rejoining;
  const q = QUALITY[quality] ?? QUALITY[ConnectionQuality.Unknown];

  let stageMessage: string | null = null;
  if (connecting) stageMessage = 'Conectando à sala…';
  else if (!remote && remoteSeen) stageMessage = `${otherName} saiu da sessão. Aguarde, a pessoa pode voltar.`;
  else if (!remote) stageMessage = isHost ? `Aguardando ${otherName} entrar…` : 'Aguardando o psicólogo entrar na sala…';

  const controlClass = (active: boolean) =>
    `w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${active
      ? 'bg-white/15 text-white hover:bg-white/25'
      : 'bg-red-500 text-white hover:bg-red-600'}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-slate-950 overflow-hidden flex flex-col ${isFullscreen ? 'h-screen' : 'h-[calc(100dvh-9rem)] min-h-[420px] rounded-3xl shadow-lg'}`}
    >
      {/* Barra superior: quem, qualidade, prontuário */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-2 p-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{otherName}</p>
          {remote && !remote.isMicrophoneEnabled && (
            <p className="text-[11px] text-amber-300">Microfone desligado</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-0.5 h-4" role="img" aria-label={q.label} title={q.label}>
            {[1, 2, 3].map((bar) => (
              <span key={bar} className={`w-1 rounded-sm ${bar <= q.bars ? q.color : 'bg-white/25'}`} style={{ height: `${bar * 5}px` }} />
            ))}
          </div>
          {isHost && recordHref && (
            <a
              href={recordHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-white/15 hover:bg-white/25 rounded-full"
            >
              Prontuário
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </div>
      </div>

      {/* Vídeo da outra pessoa */}
      <div className="flex-1 relative">
        {remoteRef && isTrackReference(remoteRef) && !remoteRef.publication.isMuted ? (
          <VideoTrack trackRef={remoteRef} className="absolute inset-0 w-full h-full object-contain" aria-label={`Vídeo de ${otherName}`} />
        ) : remote ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-24 h-24 rounded-full bg-white/10 text-white text-3xl font-bold flex items-center justify-center" aria-hidden="true">
              {otherName.charAt(0).toUpperCase()}
            </span>
            <span className="sr-only">{otherName} está com a câmera desligada</span>
          </div>
        ) : null}

        {stageMessage && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center" role="status" aria-live="polite">
            <p className="text-sm sm:text-base text-slate-200 max-w-sm">{stageMessage}</p>
          </div>
        )}

        {reconnecting && (
          <div className="absolute top-16 inset-x-0 flex justify-center z-20" role="status" aria-live="assertive">
            <span className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-semibold shadow">
              Conexão instável — reconectando…
            </span>
          </div>
        )}

        {/* Miniatura própria */}
        <div className="absolute bottom-24 right-3 z-10 w-24 aspect-[3/4] sm:w-44 sm:aspect-video landscape:w-36 landscape:aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/20 shadow-lg">
          {localRef && isTrackReference(localRef) && !localRef.publication.isMuted ? (
            <VideoTrack trackRef={localRef} className="w-full h-full object-cover -scale-x-100" aria-label="Sua câmera" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-300">Câmera desligada</div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent" role="toolbar" aria-label="Controles da chamada">
        <button type="button" onClick={() => mic.toggle()} disabled={mic.pending} aria-pressed={!mic.enabled} className={controlClass(mic.enabled)}>
          {mic.enabled ? <Mic className="w-4 h-4" aria-hidden="true" /> : <MicOff className="w-4 h-4" aria-hidden="true" />}
          <span className="sr-only sm:not-sr-only">{mic.enabled ? 'Silenciar' : 'Ativar microfone'}</span>
        </button>
        <button type="button" onClick={() => camera.toggle()} disabled={camera.pending} aria-pressed={!camera.enabled} className={controlClass(camera.enabled)}>
          {camera.enabled ? <Video className="w-4 h-4" aria-hidden="true" /> : <VideoOff className="w-4 h-4" aria-hidden="true" />}
          <span className="sr-only sm:not-sr-only">{camera.enabled ? 'Desligar câmera' : 'Ligar câmera'}</span>
        </button>
        <button type="button" onClick={() => setShowDevices(true)} className={controlClass(true)}>
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Dispositivos</span>
        </button>
        <button type="button" onClick={toggleFullscreen} aria-pressed={isFullscreen} className={controlClass(true)}>
          {isFullscreen ? <Minimize className="w-4 h-4" aria-hidden="true" /> : <Maximize className="w-4 h-4" aria-hidden="true" />}
          <span className="sr-only sm:not-sr-only">{isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="h-12 px-5 sm:h-auto sm:py-2.5 inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <PhoneOff className="w-4 h-4" aria-hidden="true" />
          Sair
        </button>
      </div>

      {showDevices && <DevicesModal onClose={() => setShowDevices(false)} />}

      {confirmLeave && (
        <ModalShell title="Sair da sessão?" onClose={() => setConfirmLeave(false)}>
          <div className="flex flex-col gap-4 p-6 pt-2">
            <p className="text-sm text-slate-600">
              {isHost
                ? 'Você pode apenas sair (e voltar depois enquanto a sala estiver aberta) ou encerrar a sessão para os dois.'
                : 'Você pode voltar enquanto a sala estiver aberta.'}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setConfirmLeave(false)} className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
                Continuar na sessão
              </button>
              <button type="button" onClick={() => leave(false)} disabled={ending} className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl cursor-pointer disabled:opacity-60">
                Sair
              </button>
              {isHost && (
                <button type="button" onClick={() => leave(true)} disabled={ending} className="px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer disabled:opacity-60">
                  {ending ? 'Encerrando…' : 'Encerrar para todos'}
                </button>
              )}
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function DeviceSelect({ kind, label }: { kind: MediaDeviceKind; label: string }) {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });
  if (devices.length === 0) return null;
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
      {label}
      <select
        value={activeDeviceId}
        onChange={(e) => setActiveMediaDevice(e.target.value)}
        className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
      >
        {devices.map((d, i) => (
          <option key={d.deviceId || i} value={d.deviceId}>{d.label || `${label} ${i + 1}`}</option>
        ))}
      </select>
    </label>
  );
}

function DevicesModal({ onClose }: { onClose: () => void }) {
  // Saída de áudio só onde o navegador permite escolher (setSinkId; ex.: não no Safari/iOS).
  const canSelectOutput = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
  return (
    <ModalShell title="Dispositivos" subtitle="Troque sem sair da chamada" onClose={onClose}>
      <div className="flex flex-col gap-3 p-6 pt-2">
        <DeviceSelect kind="audioinput" label="Microfone" />
        <DeviceSelect kind="videoinput" label="Câmera" />
        {canSelectOutput && <DeviceSelect kind="audiooutput" label="Alto-falante" />}
        <button type="button" onClick={onClose} className="self-end px-4 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl cursor-pointer">
          Concluir
        </button>
      </div>
    </ModalShell>
  );
}
