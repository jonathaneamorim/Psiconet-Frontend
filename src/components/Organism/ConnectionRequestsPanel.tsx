'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  acceptConnectionAction,
  rejectConnectionAction,
  removeConnectionAction,
} from '@/actions/connections';
import { useConnections } from '@/contexts/ConnectionContext';
import type { ConnectionRequest, UserSummaryDTO } from '@/types/connection';
import { ConfirmModal } from '../Molecules/ConfirmModal';

export type RequestsTab = 'recebidas' | 'enviadas';

interface Props {
  received: ConnectionRequest[];
  sent: ConnectionRequest[];
  /** Totais do backend (podem ser maiores que as listas, que vêm limitadas). */
  receivedTotal: number;
  sentTotal: number;
  /** Aba pedida pela URL (`?aba=`), ex.: clique na notificação de pedido de conexão. */
  initialTab?: RequestsTab;
  /** Ocorreu erro ao carregar alguma das listas. */
  error?: string;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

function profileHref(user: UserSummaryDTO) {
  const role = user.role?.toLowerCase();
  return role === 'patient' || role === 'psychologist' ? `/${role}/profile/${user.id}` : null;
}

function Avatar({ user }: { user: UserSummaryDTO }) {
  return (
    <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
      {user.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-slate-500" aria-hidden="true">
          {user.fullName?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

/**
 * Solicitações de conexão pendentes: recebidas (aceitar/recusar) e enviadas (cancelar).
 * Fica na página de conexões, com âncora `#solicitacoes` para o clique na notificação.
 */
export function ConnectionRequestsPanel({ received, sent, receivedTotal, sentTotal, initialTab, error }: Props) {
  const router = useRouter();
  const { updateConnection } = useConnections();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [receivedList, setReceivedList] = useState(received);
  const [sentList, setSentList] = useState(sent);
  const [counts, setCounts] = useState({ received: receivedTotal, sent: sentTotal });
  const [tab, setTab] = useState<RequestsTab>(
    initialTab ?? (receivedTotal === 0 && sentTotal > 0 ? 'enviadas' : 'recebidas')
  );
  const [cancelTarget, setCancelTarget] = useState<ConnectionRequest | null>(null);

  // Dados novos do servidor (revalidatePath/router.refresh) ou nova aba na URL substituem o estado
  // local — ajustado durante a renderização, sem efeito (https://react.dev/learn/you-might-not-need-an-effect).
  const [synced, setSynced] = useState({ received, sent, receivedTotal, sentTotal, initialTab });
  if (synced.received !== received || synced.sent !== sent
      || synced.receivedTotal !== receivedTotal || synced.sentTotal !== sentTotal) {
    setSynced((prev) => ({ ...prev, received, sent, receivedTotal, sentTotal }));
    setReceivedList(received);
    setSentList(sent);
    setCounts({ received: receivedTotal, sent: sentTotal });
  }
  if (synced.initialTab !== initialTab) {
    setSynced((prev) => ({ ...prev, initialTab }));
    if (initialTab) setTab(initialTab);
  }

  function run(
    request: ConnectionRequest,
    action: (id: string) => Promise<{ error?: string }>,
    onSuccess: () => void,
    successMessage: string
  ) {
    setBusyId(request.id);
    startTransition(async () => {
      const result = await action(request.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        onSuccess();
        toast.success(successMessage);
        router.refresh();
      }
      setBusyId(null);
    });
  }

  function accept(request: ConnectionRequest) {
    run(request, acceptConnectionAction, () => {
      setReceivedList((prev) => prev.filter((r) => r.id !== request.id));
      setCounts((c) => ({ ...c, received: Math.max(0, c.received - 1) }));
      updateConnection(request.sender.id, 'CONNECTED', request.id);
    }, 'Conexão aceita!');
  }

  function reject(request: ConnectionRequest) {
    run(request, rejectConnectionAction, () => {
      setReceivedList((prev) => prev.filter((r) => r.id !== request.id));
      setCounts((c) => ({ ...c, received: Math.max(0, c.received - 1) }));
      updateConnection(request.sender.id, 'NONE');
    }, 'Solicitação recusada.');
  }

  function cancel(request: ConnectionRequest) {
    run(request, removeConnectionAction, () => {
      setSentList((prev) => prev.filter((r) => r.id !== request.id));
      setCounts((c) => ({ ...c, sent: Math.max(0, c.sent - 1) }));
      updateConnection(request.receiver.id, 'NONE');
    }, 'Solicitação cancelada.');
  }

  const list = tab === 'recebidas' ? receivedList : sentList;
  const total = tab === 'recebidas' ? counts.received : counts.sent;

  const tabButton = (value: RequestsTab, label: string, count: number) => (
    <button
      type="button"
      role="tab"
      id={`solicitacoes-tab-${value}`}
      aria-selected={tab === value}
      aria-controls="solicitacoes-painel"
      onClick={() => setTab(value)}
      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
        tab === value ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
      <span
        className={`ml-2 inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full text-xs ${
          value === 'recebidas' && count > 0 ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <section id="solicitacoes" aria-labelledby="solicitacoes-titulo" className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 id="solicitacoes-titulo" className="text-lg font-bold text-slate-800">Solicitações de conexão</h2>
        <div role="tablist" aria-label="Tipo de solicitação" className="flex bg-slate-100 p-1 rounded-2xl">
          {tabButton('recebidas', 'Recebidas', counts.received)}
          {tabButton('enviadas', 'Enviadas', counts.sent)}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div id="solicitacoes-painel" role="tabpanel" aria-labelledby={`solicitacoes-tab-${tab}`}>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            {tab === 'recebidas' ? 'Nenhuma solicitação recebida aguardando resposta.' : 'Nenhuma solicitação enviada aguardando resposta.'}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {list.map((request) => {
              const other = tab === 'recebidas' ? request.sender : request.receiver;
              const href = profileHref(other);
              const busy = isPending && busyId === request.id;
              const name = other.fullName || 'Usuário';
              return (
                <li key={request.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar user={other} />
                    <div className="min-w-0">
                      {href ? (
                        <Link href={href} className="block text-sm font-semibold text-slate-800 truncate hover:text-[var(--primary)] hover:underline">
                          {name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {tab === 'recebidas' ? 'Quer se conectar com você' : 'Aguardando resposta'}
                        {formatDate(request.requestedAt) && ` · ${formatDate(request.requestedAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {tab === 'recebidas' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => accept(request)}
                          disabled={isPending}
                          aria-label={`Aceitar solicitação de ${name}`}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition"
                        >
                          {busy ? 'Aguarde…' : 'Aceitar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(request)}
                          disabled={isPending}
                          aria-label={`Recusar solicitação de ${name}`}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                        >
                          Recusar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(request)}
                        disabled={isPending}
                        aria-label={`Cancelar solicitação enviada a ${name}`}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        {busy ? 'Cancelando…' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {total > list.length && list.length > 0 && (
          <p className="pt-3 text-xs text-slate-400">Exibindo as {list.length} mais recentes de {total}.</p>
        )}
      </div>

      {cancelTarget && (
        <ConfirmModal
          title="Cancelar solicitação"
          description={`Cancelar a solicitação de conexão enviada a ${cancelTarget.receiver.fullName || 'este usuário'}?`}
          confirmLabel="Sim, cancelar"
          confirmVariant="danger"
          onConfirm={() => {
            cancel(cancelTarget);
            setCancelTarget(null);
          }}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </section>
  );
}
