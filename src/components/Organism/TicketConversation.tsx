'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import {
  adminReplyTicketAction,
  adminUpdateTicketPriorityAction,
  adminUpdateTicketStatusAction,
  closeMyTicketAction,
  replyTicketAction,
} from '@/actions/tickets';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/Atoms/TicketBadges';
import { ConfirmModal } from '@/components/Molecules/ConfirmModal';
import {
  TICKET_CATEGORY_LABEL,
  TICKET_LIMITS,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type TicketDetail,
  type TicketPriority,
  type TicketStatus,
} from '@/types/ticket';
import { formatDateTime } from '@/lib/datetime';

interface Props {
  initial: TicketDetail;
  mode: 'user' | 'admin';
}

/**
 * Detalhe + conversa de um chamado. Todo texto vindo de usuários é renderizado como texto (React
 * escapa), com quebras de linha preservadas por CSS — nunca como HTML.
 */
export function TicketConversation({ initial, mode }: Props) {
  const [ticket, setTicket] = useState(initial);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isAdmin = mode === 'admin';

  function apply(result: { error?: string; data?: TicketDetail; fields?: Record<string, string> }, success: string) {
    if (result.error) {
      setError(result.fields?.content ?? result.error);
      toast.error(result.error);
      return false;
    }
    if (result.data) setTicket(result.data);
    toast.success(success);
    return true;
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const text = content.trim();
    if (!text) {
      setError('Escreva uma mensagem.');
      return;
    }
    startTransition(async () => {
      const result = isAdmin ? await adminReplyTicketAction(ticket.id, text) : await replyTicketAction(ticket.id, text);
      if (apply(result, isAdmin ? 'Resposta enviada. O usuário foi notificado.' : 'Mensagem enviada.')) setContent('');
    });
  }

  function handleStatus(status: TicketStatus) {
    startTransition(async () => {
      const result = await adminUpdateTicketStatusAction(ticket.id, status);
      apply(result, status === 'RESOLVED' || status === 'CLOSED'
        ? 'Chamado finalizado. O usuário foi notificado.'
        : 'Situação atualizada.');
    });
  }

  function handlePriority(priority: TicketPriority) {
    startTransition(async () => {
      apply(await adminUpdateTicketPriorityAction(ticket.id, priority), 'Prioridade atualizada.');
    });
  }

  function handleUserClose() {
    setConfirmClose(false);
    startTransition(async () => {
      apply(await closeMyTicketAction(ticket.id), 'Chamado encerrado.');
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho do chamado */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-mono">{ticket.protocol}</span>
          <span aria-hidden="true">·</span>
          <span>{TICKET_CATEGORY_LABEL[ticket.category]}</span>
          <span aria-hidden="true">·</span>
          <span>Aberto em {formatDateTime(ticket.createdAt)}</span>
        </div>
        <h1 className="mt-2 text-xl sm:text-2xl font-bold text-slate-800 break-words">{ticket.subject}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <TicketStatusBadge status={ticket.status} />
          {isAdmin && <TicketPriorityBadge priority={ticket.priority} />}
        </div>

        {isAdmin && (
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Solicitante</dt><dd className="text-slate-800">{ticket.requesterName}</dd></div>
            <div><dt className="text-xs text-slate-500">Perfil</dt><dd className="text-slate-800">{ticket.requesterRole === 'PSYCHOLOGIST' ? 'Psicólogo(a)' : 'Paciente'}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-slate-500">E-mail</dt><dd className="text-slate-800 truncate">{ticket.requesterEmail}</dd></div>
          </dl>
        )}

        <div className="mt-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</h2>
          <p className="mt-2 text-sm text-slate-700 whitespace-pre-line break-words">{ticket.description}</p>
        </div>
      </section>

      {/* Controles do admin */}
      {isAdmin && (
        <section aria-label="Gerenciar chamado" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-end">
          <label className="flex-1">
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">Prioridade</span>
            <select value={ticket.priority} disabled={isPending || ticket.status === 'CLOSED'}
              onChange={(e) => handlePriority(e.target.value as TicketPriority)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
              {(Object.keys(TICKET_PRIORITY_LABEL) as TicketPriority[]).map((p) => (
                <option key={p} value={p}>{TICKET_PRIORITY_LABEL[p]}</option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">Situação</span>
            <select value={ticket.status} disabled={isPending || ticket.status === 'CLOSED'}
              onChange={(e) => handleStatus(e.target.value as TicketStatus)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white">
              {(Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => (
                <option key={s} value={s}>{TICKET_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <button type="button" onClick={() => handleStatus('RESOLVED')} disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-60">
              Marcar como resolvido
            </button>
          )}
        </section>
      )}

      {/* Conversa */}
      <section aria-labelledby="conversa-titulo" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 id="conversa-titulo" className="px-5 sm:px-6 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700">
          Conversa
        </h2>
        {ticket.messages.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            {isAdmin ? 'Nenhuma resposta ainda. Responda abaixo.' : 'Ainda sem respostas. Você será notificado assim que a equipe responder.'}
          </p>
        ) : (
          <ol className="px-4 sm:px-6 py-5 flex flex-col gap-4" aria-live="polite">
            {ticket.messages.map((m) => {
              const alignRight = m.mine;
              return (
                <li key={m.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                  <article className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.fromSupport ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-200'}`}>
                    <header className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{m.mine ? 'Você' : m.authorName}</span>
                      {m.fromSupport && !m.mine && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Suporte</span>
                      )}
                      <time dateTime={m.createdAt} className="text-slate-500">{formatDateTime(m.createdAt)}</time>
                    </header>
                    <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-line break-words">{m.content}</p>
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        {ticket.canReply ? (
          <form onSubmit={handleReply} className="border-t border-slate-100 p-4 sm:p-5 flex flex-col gap-3" noValidate>
            <label htmlFor="ticket-reply" className="text-sm font-semibold text-slate-700">
              {isAdmin ? 'Responder ao usuário' : 'Enviar mensagem'}
            </label>
            <textarea id="ticket-reply" value={content} maxLength={TICKET_LIMITS.messageMax} rows={4}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
              aria-invalid={error ? true : undefined} aria-describedby={error ? 'ticket-reply-error' : undefined} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                {error
                  ? <p id="ticket-reply-error" role="alert" className="text-red-600">{error}</p>
                  : <span className="text-slate-400">{content.length}/{TICKET_LIMITS.messageMax}</span>}
              </div>
              <div className="flex gap-2">
                {!isAdmin && (
                  <button type="button" onClick={() => setConfirmClose(true)} disabled={isPending}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                    Encerrar chamado
                  </button>
                )}
                <button type="submit" disabled={isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
                  {isPending ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Este chamado foi encerrado{ticket.closedAt ? ` em ${formatDateTime(ticket.closedAt)}` : ''}.
            {!isAdmin && ' Se precisar de ajuda novamente, abra um novo chamado.'}
          </p>
        )}
      </section>

      {confirmClose && (
        <ConfirmModal
          title="Encerrar chamado?"
          description="Depois de encerrado, o chamado não recebe novas mensagens. Você pode abrir outro se precisar."
          confirmLabel="Encerrar"
          confirmVariant="danger"
          onConfirm={handleUserClose}
          onClose={() => setConfirmClose(false)}
        />
      )}
    </div>
  );
}
