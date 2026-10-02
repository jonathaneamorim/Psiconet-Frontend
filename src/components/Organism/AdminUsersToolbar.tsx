'use client';

import { useState } from 'react';
import { CreateAdminModal } from '@/components/Molecules/CreateAdminModal';

/** Botão "Novo administrador" (abre o modal de criação). */
export function AdminUsersToolbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl shadow-sm transition-colors self-start sm:self-auto">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Novo administrador
      </button>
      {open && <CreateAdminModal onClose={() => setOpen(false)} />}
    </>
  );
}
