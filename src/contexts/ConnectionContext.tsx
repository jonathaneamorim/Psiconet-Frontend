'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ConnectionStatus } from '@/types/profile';

interface ConnectionState {
  status: ConnectionStatus;
  connectionId?: string;
}

interface ConnectionContextType {
  connections: Record<string, ConnectionState>; // map of userId -> state
  updateConnection: (userId: string, status: ConnectionStatus, connectionId?: string) => void;
  getConnectionState: (userId: string) => ConnectionState | undefined;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Record<string, ConnectionState>>({});

  const updateConnection = useCallback((userId: string, status: ConnectionStatus, connectionId?: string) => {
    setConnections(prev => ({
      ...prev,
      [userId]: {
        status,
        connectionId: connectionId ?? prev[userId]?.connectionId,
      },
    }));
  }, []);

  const getConnectionState = useCallback((userId: string) => {
    return connections[userId];
  }, [connections]);

  // Optionally avoid rendering children until loaded to prevent hydration mismatch,
  // but since initialStatus is passed, it's safe to render.
  return (
    <ConnectionContext.Provider value={{ connections, updateConnection, getConnectionState }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
}
