'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { AdminUser } from '@/types/admin';
import { updateUserStatusAction } from '@/actions/admin';
import { UserStatusBadge } from '@/components/Atoms/UserStatusBadge';
import { UserRoleBadge } from '@/components/Atoms/UserRoleBadge';
import { EditUserModal } from '@/components/Molecules/EditUserModal';
import { NotifyUserModal } from '@/components/Molecules/NotifyUserModal';
import { ConfirmModal } from '@/components/Molecules/ConfirmModal';

interface Props {
  users: AdminUser[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

const actionBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Tabela administrativa de usuários: nome, perfil, data de criação, situação e CPF mascarado
 * (a máscara vem pronta do backend). As regras (admin base, auto-inativação, último admin) são
 * impostas pelo backend; aqui só refletimos o que é previsível (ex.: admin base sem botão).
 */
export function UsersTable({ users }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [notifyingUser, setNotifyingUser] = useState<AdminUser | null>(null);
  const [togglingUser, setTogglingUser] = useState<AdminUser | null>(null);

  function handleToggleStatus() {
    if (!togglingUser) return;
    const target = togglingUser;
    const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    startTransition(async () => {
      const result = await updateUserStatusAction(target.id, { status: newStatus });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(newStatus === 'INACTIVE' ? 'Usuário inativado. As sessões dele foram encerradas.' : 'Usuário ativado.');
        router.refresh();
      }
      setTogglingUser(null);
    });
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-sm font-medium">Nenhum usuário encontrado com esses filtros.</p>
      </div>
    );
  }

  const renderActions = (user: AdminUser, compact = false) => (
    <div className={`flex items-center gap-2 ${compact ? '' : 'justify-end'} flex-wrap`}>
      <button type="button" onClick={() => setEditingUser(user)}
        className={`${actionBase} text-[var(--primary)] bg-blue-50 hover:bg-blue-100`}
        aria-label={`Editar ${user.fullName ?? user.email}`}>
        Editar
      </button>
      <button type="button" onClick={() => setNotifyingUser(user)}
        className={`${actionBase} text-slate-700 bg-slate-100 hover:bg-slate-200`}
        aria-label={`Enviar comunicado para ${user.fullName ?? user.email}`}>
        Notificar
      </button>
      {user.baseAdmin ? (
        <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-1"
          title="O administrador base não pode ser inativado">
          Admin base
        </span>
      ) : user.status === 'ACTIVE' ? (
        <button type="button" onClick={() => setTogglingUser(user)} disabled={isPending}
          className={`${actionBase} text-red-600 bg-red-50 hover:bg-red-100`}
          aria-label={`Inativar ${user.fullName ?? user.email}`}>
          Inativar
        </button>
      ) : (
        <button type="button" onClick={() => setTogglingUser(user)} disabled={isPending}
          className={`${actionBase} text-emerald-700 bg-emerald-50 hover:bg-emerald-100`}
          aria-label={`Ativar ${user.fullName ?? user.email}`}>
          Ativar
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Tabela desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Usuários cadastrados na plataforma</caption>
          <thead>
            <tr className="border-b border-slate-100">
              {['Nome', 'Perfil', 'Criado em', 'Situação', 'CPF'].map((h) => (
                <th key={h} scope="col" className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
              <th scope="col" className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
                      {user.fullName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 leading-tight truncate">{user.fullName ?? '—'}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4"><UserRoleBadge role={user.role} /></td>
                <td className="py-3.5 px-4 text-slate-600 tabular-nums">{formatDate(user.createdAt)}</td>
                <td className="py-3.5 px-4"><UserStatusBadge status={user.status} /></td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600" aria-label="CPF mascarado">{user.maskedCpf}</td>
                <td className="py-3.5 px-4">{renderActions(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <ul className="md:hidden divide-y divide-slate-100">
        {users.map((user) => (
          <li key={user.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0" aria-hidden="true">
                {user.fullName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{user.fullName ?? '—'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email ?? '—'}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-slate-400">Perfil</dt><dd className="mt-0.5"><UserRoleBadge role={user.role} /></dd></div>
              <div><dt className="text-slate-400">Situação</dt><dd className="mt-0.5"><UserStatusBadge status={user.status} /></dd></div>
              <div><dt className="text-slate-400">Criado em</dt><dd className="mt-0.5 text-slate-700">{formatDate(user.createdAt)}</dd></div>
              <div><dt className="text-slate-400">CPF</dt><dd className="mt-0.5 font-mono text-slate-700">{user.maskedCpf}</dd></div>
            </dl>
            {renderActions(user, true)}
          </li>
        ))}
      </ul>

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
      {notifyingUser && <NotifyUserModal user={notifyingUser} onClose={() => setNotifyingUser(null)} />}

      {togglingUser && (
        <ConfirmModal
          title={togglingUser.status === 'ACTIVE' ? 'Inativar usuário?' : 'Ativar usuário?'}
          description={
            togglingUser.status === 'ACTIVE'
              ? `"${togglingUser.fullName || togglingUser.email}" não poderá mais acessar a plataforma e as sessões abertas serão encerradas.`
              : `"${togglingUser.fullName || togglingUser.email}" voltará a ter acesso à plataforma.`
          }
          confirmLabel={togglingUser.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}
          confirmVariant={togglingUser.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleToggleStatus}
          onClose={() => setTogglingUser(null)}
        />
      )}
    </>
  );
}
