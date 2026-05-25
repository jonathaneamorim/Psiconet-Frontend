'use client';

import { useEffect } from 'react';
import { ConnectionStatus } from '@/types/profile';
import { useConnections } from '@/contexts/ConnectionContext';
import { useConnectionActions } from '@/hooks/useConnectionActions';
import { Button } from '../Atoms/Button';

interface ConnectionButtonProps {
  userId: string;
  initialStatus: ConnectionStatus;
  connectionId?: string; // Needed for accept/reject/remove
}

export function ConnectionButton({ userId, initialStatus, connectionId }: ConnectionButtonProps) {
  const { getConnectionState, updateConnection } = useConnections();
  const { isPending, sendRequest, acceptRequest, rejectRequest, removeConnection } = useConnectionActions();

  // Sempre que o initialStatus vindo do backend mudar (ex: recarregou a página ou um request foi aceito),
  // atualizamos o contexto para refletir a nova realidade, sobrepondo o estado local.
  useEffect(() => {
    updateConnection(userId, initialStatus, connectionId);
  }, [userId, initialStatus, connectionId, updateConnection]);

  const globalState = getConnectionState(userId);
  const status = globalState?.status ?? initialStatus;
  const currentConnectionId = globalState?.connectionId ?? connectionId;

  if (status === 'NONE') {
    return (
      <Button variant="primary" onClick={() => sendRequest(userId)} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Enviando...' : 'Conectar'}
      </Button>
    );
  }

  if (status === 'PENDING_SENT') {
    return (
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="secondary" disabled className="flex-1 opacity-70">
          Enviada
        </Button>
        <Button variant="tertiary" onClick={() => currentConnectionId && removeConnection(userId, currentConnectionId)} disabled={isPending || !currentConnectionId} className="text-red-600 hover:bg-red-50">
          {!currentConnectionId ? 'Atualize para Cancelar' : 'Cancelar'}
        </Button>
      </div>
    );
  }

  if (status === 'PENDING_RECEIVED') {
    return (
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="primary" onClick={() => currentConnectionId && acceptRequest(userId, currentConnectionId)} disabled={isPending || !currentConnectionId} className="flex-1">
          Aceitar
        </Button>
        <Button variant="tertiary" onClick={() => currentConnectionId && rejectRequest(userId, currentConnectionId)} disabled={isPending || !currentConnectionId} className="flex-1 text-red-600 hover:bg-red-50">
          {!currentConnectionId ? 'Atualize para Rejeitar' : 'Rejeitar'}
        </Button>
      </div>
    );
  }

  if (status === 'CONNECTED') {
    return (
      <Button variant="tertiary" onClick={() => currentConnectionId && removeConnection(userId, currentConnectionId)} disabled={isPending || !currentConnectionId} className="w-full sm:w-auto text-slate-600 hover:text-red-600 hover:bg-red-50">
        {!currentConnectionId ? 'Atualize para Remover' : 'Remover Conexão'}
      </Button>
    );
  }

  return null;
}
