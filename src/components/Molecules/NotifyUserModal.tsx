'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { notifyUserAction } from '@/actions/admin';
import { ModalShell } from '@/components/Molecules/ModalShell';
import type { AdminUser } from '@/types/admin';

interface Props {
  user: AdminUser;
  onClose: () => void;
}

const TITLE_MAX = 120;
const MESSAGE_MAX = 2000;

/** Comunicado do admin a um usuário: notificação no site + e-mail personalizado. */
export function NotifyUserModal({ user, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (title.trim().length < 3) local.title = 'O título deve ter pelo menos 3 caracteres.';
    if (message.trim().length < 3) local.message = 'Escreva a mensagem.';
    if (Object.keys(local).length) { setErrors(local); return; }

    startTransition(async () => {
      const result = await notifyUserAction({ recipientId: user.id, title: title.trim(), message: message.trim() });
      if (result.error) {
        setErrors(result.fields ?? {});
        toast.error(result.error);
        return;
      }
      toast.success('Comunicado enviado (notificação e e-mail).');
      onClose();
    });
  }

  return (
    <ModalShell title="Enviar comunicado" subtitle={`Para: ${user.fullName ?? user.email ?? ''}`} onClose={onClose} widthClass="max-w-lg">
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
        <div>
          <label htmlFor="notify-title" className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
          <input id="notify-title" value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          {errors.title && <p role="alert" className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="notify-message" className="block text-sm font-medium text-slate-700 mb-1.5">Mensagem</label>
          <textarea id="notify-message" value={message} maxLength={MESSAGE_MAX} rows={6} onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y" />
          <div className="flex justify-between mt-1">
            {errors.message ? <p role="alert" className="text-xs text-red-600">{errors.message}</p> : <span />}
            <span className="text-xs text-slate-400">{message.length}/{MESSAGE_MAX}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
          O usuário recebe uma notificação obrigatória no site e um e-mail com este texto.
          Não inclua dados clínicos ou sensíveis.
        </p>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
            {isPending ? 'Enviando…' : 'Enviar comunicado'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
