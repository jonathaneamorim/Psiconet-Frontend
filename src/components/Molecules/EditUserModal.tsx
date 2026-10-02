'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { AdminUser } from '@/types/admin';
import { updateUserAction } from '@/actions/admin';
import { UserRoleBadge } from '@/components/Atoms/UserRoleBadge';
import { ModalShell } from '@/components/Molecules/ModalShell';

interface Props {
  user: AdminUser;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow';

/**
 * Correção de dados cadastrais. Papel (role) e situação NÃO são editáveis aqui: o papel nunca muda
 * e a situação tem fluxo próprio (ativar/inativar) com as proteções do backend.
 */
export function EditUserModal({ user, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user.email ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      setFieldErrors({ fullName: 'O nome completo deve ter pelo menos 3 caracteres.' });
      return;
    }

    startTransition(async () => {
      const result = await updateUserAction(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() !== (user.email ?? '') ? email.trim() : undefined,
      });

      if (result.error) {
        setFieldErrors(result.fields ?? {});
        toast.error(result.error);
        return;
      }

      toast.success('Usuário atualizado com sucesso!');
      router.refresh();
      onClose();
    });
  }

  return (
    <ModalShell title="Editar usuário" subtitle={user.email ?? undefined} onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-400 block mb-0.5">CPF</span>
            <span className="font-mono">{user.maskedCpf}</span>
          </div>
          <div>
            <span className="font-medium text-slate-400 block mb-1">Perfil</span>
            <UserRoleBadge role={user.role} />
          </div>
        </div>

        <div>
          <label htmlFor="edit-fullName" className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
          <input id="edit-fullName" type="text" value={fullName} maxLength={150}
            onChange={(e) => setFullName(e.target.value)} className={inputClass} required
            aria-invalid={fieldErrors.fullName ? true : undefined} />
          {fieldErrors.fullName && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
          <input id="edit-email" type="email" value={email} maxLength={254}
            onChange={(e) => setEmail(e.target.value)} className={inputClass}
            aria-invalid={fieldErrors.email ? true : undefined} />
          {fieldErrors.email
            ? <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            : <p className="mt-1 text-xs text-slate-400">Alterar o e-mail encerra as sessões abertas do usuário.</p>}
        </div>

        <div>
          <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
          <input id="edit-phone" type="tel" value={phone} maxLength={20}
            onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Deixe em branco para manter"
            aria-invalid={fieldErrors.phone ? true : undefined} />
          {fieldErrors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
