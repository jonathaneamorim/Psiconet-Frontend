'use client';

import { useCallback, useEffect, useState } from 'react';
import { queryMediaPermission, type MediaKind, type MediaPermissionState } from '@/lib/mediaPermission';

type PermissionMap = Record<MediaKind, MediaPermissionState>;

/**
 * Estado atual da permissão de câmera e microfone, atualizado quando o usuário muda a permissão
 * nas configurações do navegador (onde a Permissions API suporta; senão fica "unknown").
 */
export function useMediaPermissions() {
  const [state, setState] = useState<PermissionMap>({ camera: 'unknown', microphone: 'unknown' });

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    (['camera', 'microphone'] as const).forEach(async (kind) => {
      const status = await queryMediaPermission(kind);
      if (!status || cancelled) return;
      const update = () => setState((prev) => ({ ...prev, [kind]: status.state }));
      update();
      status.addEventListener('change', update);
      cleanups.push(() => status.removeEventListener('change', update));
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // Após um pedido feito pela página, o resultado já é conhecido mesmo sem Permissions API.
  const markResult = useCallback((kinds: MediaKind[], result: MediaPermissionState) => {
    setState((prev) => {
      const next = { ...prev };
      kinds.forEach((kind) => { next[kind] = result; });
      return next;
    });
  }, []);

  return { permissions: state, markResult };
}
