'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { useConnections } from '@/contexts/ConnectionContext';
import {
  sendConnectionRequestAction,
  acceptConnectionAction,
  rejectConnectionAction,
  removeConnectionAction
} from '@/actions/connections';

export function useConnectionActions() {
  const [isPending, startTransition] = useTransition();
  const { updateConnection } = useConnections();

  const sendRequest = (userId: string) => {
    startTransition(async () => {
      const result = await sendConnectionRequestAction(userId);

      if (result.error) {
        toast.error(result.error);
      } else {
        updateConnection(userId, 'PENDING_SENT', result.connectionId);
        toast.success('Solicitação de conexão enviada!');
      }
    });
  };

  const acceptRequest = (userId: string, connectionId: string) => {
    startTransition(async () => {
      const result = await acceptConnectionAction(connectionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        updateConnection(userId, 'CONNECTED', connectionId);
        toast.success('Conexão aceita!');
      }
    });
  };

  const rejectRequest = (userId: string, connectionId: string) => {
    startTransition(async () => {
      const result = await rejectConnectionAction(connectionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        updateConnection(userId, 'NONE');
        toast.success('Solicitação rejeitada.');
      }
    });
  };

  const removeConnection = (userId: string, connectionId: string) => {
    startTransition(async () => {
      try {
        const result = await removeConnectionAction(connectionId);
        if (result.error) {
          console.error("Remove failed:", result.error);
          toast.error(result.error);
        } else {
          updateConnection(userId, 'NONE');
          toast.success('Conexão removida.');
        }
      } catch (err) {
        console.error("Remove hook error:", err);
      }
    });
  };

  return {
    isPending,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  };
}
