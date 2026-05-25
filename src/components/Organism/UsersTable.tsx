'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { AdminUser } from '@/types/admin';
import { updateUserStatusAction } from '@/actions/admin';
import { UserStatusBadge } from '@/components/Atoms/UserStatusBadge';
import { UserRoleBadge } from '@/components/Atoms/UserRoleBadge';
import { EditUserModal } from '@/components/Molecules/EditUserModal';
import { ConfirmModal } from '@/components/Molecules/ConfirmModal';

interface Props {
  users: AdminUser[];
}

export function UsersTable({ users }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [togglingUser, setTogglingUser] = useState<AdminUser | null>(null);

  function handleToggleStatus() {
    if (!togglingUser) return;

    const newStatus = togglingUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    startTransition(async () => {
      const result = await updateUserStatusAction(togglingUser.id, { status: newStatus });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          newStatus === 'INACTIVE'
            ? 'Usuário inativado com sucesso.'
            : 'Usuário ativado com sucesso.'
        );
        router.refresh();
      }
      setTogglingUser(null);
    });
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabela desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Usuário</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">CPF</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Perfil</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.fullName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 leading-tight">{user.fullName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{user.maskedCpf}</td>
                <td className="py-3.5 px-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="py-3.5 px-4">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Editar */}
                    <button
                      onClick={() => setEditingUser(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar usuário"
                      id={`edit-user-${user.id}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>

                    {/* Ativar / Inativar */}
                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => setTogglingUser(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Inativar usuário"
                        id={`deactivate-user-${user.id}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Inativar
                      </button>
                    ) : (
                      <button
                        onClick={() => setTogglingUser(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Ativar usuário"
                        id={`activate-user-${user.id}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden divide-y divide-slate-100">
        {users.map((user) => (
          <div key={user.id} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.fullName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{user.fullName ?? '—'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
              <span className="text-xs font-mono text-slate-400">{user.maskedCpf}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingUser(user)}
                className="flex-1 py-2 text-xs font-medium text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Editar
              </button>
              {user.status === 'ACTIVE' ? (
                <button
                  onClick={() => setTogglingUser(user)}
                  className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Inativar
                </button>
              ) : (
                <button
                  onClick={() => setTogglingUser(user)}
                  className="flex-1 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  Ativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modais */}
      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}

      {togglingUser && (
        <ConfirmModal
          title={togglingUser.status === 'ACTIVE' ? 'Inativar usuário?' : 'Ativar usuário?'}
          description={
            togglingUser.status === 'ACTIVE'
              ? `O usuário "${togglingUser.fullName || togglingUser.email}" será inativado e não poderá mais acessar a plataforma.`
              : `O usuário "${togglingUser.fullName || togglingUser.email}" será reativado e voltará a ter acesso à plataforma.`
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
