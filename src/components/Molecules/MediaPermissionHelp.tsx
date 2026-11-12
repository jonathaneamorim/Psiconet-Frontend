'use client';

import { useEffect, useState } from 'react';
import { CameraOff, MicOff } from 'lucide-react';
import {
  detectBrowser,
  isPermissionError,
  kindsLabel,
  permissionSteps,
  requestMediaAccess,
  type MediaKind,
  type MediaPermissionState,
} from '@/lib/mediaPermission';
import { mediaErrorMessage } from '@/lib/videoCall';

interface Props {
  /** Dispositivos que o usuário tentou ligar. */
  kinds: MediaKind[];
  permissions: Record<MediaKind, MediaPermissionState>;
  markResult: (kinds: MediaKind[], result: MediaPermissionState) => void;
  /** Chamado quando todos os `kinds` ficam permitidos (pelo pedido do navegador ou pelas configurações). */
  onGranted: (kinds: MediaKind[]) => void;
  onDismiss?: () => void;
}

/**
 * Explica por que a câmera/microfone não ligou e ajuda a liberar: se o navegador ainda pode perguntar,
 * o botão abre o pedido nativo; se está bloqueado, mostra os passos do navegador em uso e liga sozinho
 * quando a permissão muda.
 */
export function MediaPermissionHelp({ kinds, permissions, markResult, onGranted, onDismiss }: Props) {
  const [browser] = useState(() => detectBrowser(typeof navigator === 'undefined' ? '' : navigator.userAgent));
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = kinds.some((kind) => permissions[kind] === 'denied');
  const allGranted = kinds.every((kind) => permissions[kind] === 'granted');

  useEffect(() => {
    if (allGranted) onGranted(kinds);
  }, [allGranted, kinds, onGranted]);

  const request = async () => {
    setRequesting(true);
    setError(null);
    const failure = await requestMediaAccess(kinds);
    setRequesting(false);
    if (!failure) {
      markResult(kinds, 'granted');
      return;
    }
    if (isPermissionError(failure)) {
      markResult(kinds, 'denied');
      setError('O navegador não liberou o acesso. Siga os passos acima para desbloquear.');
    } else {
      setError(mediaErrorMessage(failure));
    }
  };

  const Icon = kinds.includes('camera') ? CameraOff : MicOff;

  return (
    <div role="alert" className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center" aria-hidden="true">
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold">Permita o acesso {kindsLabel(kinds)}</p>
          <p className="text-xs leading-relaxed">
            {blocked
              ? 'O acesso está bloqueado no navegador, então a Psiconet não consegue ligar o dispositivo. Para liberar:'
              : 'A outra pessoa só vê e ouve você com a sua permissão. Clique em "Permitir acesso" e confirme no aviso do navegador.'}
          </p>
        </div>
      </div>

      {blocked && (
        <ol className="list-decimal pl-5 flex flex-col gap-1 text-xs leading-relaxed">
          {permissionSteps(browser, kinds).map((step) => <li key={step}>{step}</li>)}
        </ol>
      )}

      {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={request}
          disabled={requesting}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          {requesting ? 'Aguardando o navegador…' : blocked ? 'Já permiti, tentar de novo' : 'Permitir acesso'}
        </button>
        {blocked && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-amber-900 bg-white border border-amber-200 hover:bg-amber-100 rounded-xl cursor-pointer"
          >
            Recarregar a página
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 rounded-xl cursor-pointer"
          >
            Continuar sem {kinds.length === 2 ? 'câmera e microfone' : kinds[0] === 'camera' ? 'câmera' : 'microfone'}
          </button>
        )}
      </div>
    </div>
  );
}
