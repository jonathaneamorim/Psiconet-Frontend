'use client';

import { useState, useEffect, useRef } from 'react';
import { getPendingRequestsAction } from '@/actions/connections';
import { ConnectionRequest } from '@/types/connection';
import { ConnectionButton } from '../Molecules/ConnectionButton';
import { useConnections } from '@/contexts/ConnectionContext';

export function ConnectionRequestsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { getConnectionState } = useConnections();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data } = await getPendingRequestsAction();
    if (data?.content) {
      setRequests(data.content);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) fetchRequests();
    setIsOpen(!isOpen);
  };

  // Only show requests that are still PENDING_RECEIVED in the global context
  // (or don't exist in the context yet, which defaults to their initial state).
  const visibleRequests = requests.filter(req => {
    const globalState = getConnectionState(req.sender.id);
    if (globalState) {
      return globalState.status === 'PENDING_RECEIVED';
    }
    return true; // Still pending if no global state overrides it
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full text-slate-500 hover:text-[var(--primary)] hover:bg-blue-50 transition-colors focus:outline-none"
        aria-label="Solicitações de conexão"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {visibleRequests.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
            {visibleRequests.length}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      <div className={`absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 origin-top-right transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Solicitações de Conexão</h3>
          <span className="text-xs text-slate-500">{visibleRequests.length} pendentes</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Carregando...</div>
          ) : visibleRequests.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">Nenhuma solicitação pendente.</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {visibleRequests.map((req) => (
                <li key={req.id} className="flex flex-col gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {req.sender.photoUrl ? (
                        <img src={req.sender.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">{req.sender.fullName?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{req.sender.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">Deseja conectar-se com você</p>
                    </div>
                  </div>
                  <ConnectionButton 
                    userId={req.sender.id} 
                    initialStatus="PENDING_RECEIVED" 
                    connectionId={req.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
