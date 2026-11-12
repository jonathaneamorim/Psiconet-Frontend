'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createAdminAction } from '@/actions/admin';
import { ModalShell } from '@/components/Molecules/ModalShell';
import { maskCpf as formatCpf, normalizeCpf } from '@/lib/cpf';
import { validatePassword } from '@/lib/password';

interface Props {
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent';

/**
 * Cria um NOVO administrador (conta nova, nunca promoção de paciente/psicólogo).
 * A senha temporária é combinada fora da plataforma; o convite por e-mail não a contém.
 */
export function CreateAdminModal({ onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cpf, setCpf] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get('fullName') ?? '').trim(),
      email: String(form.get('email') ?? '').trim().toLowerCase(),
      cpf: normalizeCpf(cpf),
      temporaryPassword: String(form.get('temporaryPassword') ?? ''),
    };

    const local: Record<string, string> = {};
    if (payload.fullName.length < 3) local.fullName = 'Informe o nome completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) local.email = 'Informe um e-mail válido.';
    if (payload.cpf.length !== 11) local.cpf = 'Informe um CPF válido.';
    const pwd = validatePassword(payload.temporaryPassword);
    if (pwd) local.temporaryPassword = pwd;
    if (Object.keys(local).length) { setErrors(local); return; }

    startTransition(async () => {
      const result = await createAdminAction(payload);
      if (result.error) {
        setErrors(result.fields ?? {});
        toast.error(result.error);
        return;
      }
      toast.success('Administrador criado. O convite foi enviado por e-mail.');
      router.refresh();
      onClose();
    });
  }

  const field = (name: string, label: string, input: React.ReactNode, hint?: string) => (
    <div>
      <label htmlFor={`admin-${name}`} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {input}
      {errors[name]
        ? <p role="alert" className="mt-1 text-xs text-red-600">{errors[name]}</p>
        : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );

  return (
    <ModalShell title="Novo administrador" subtitle="Somente administradores podem criar administradores" onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 leading-relaxed">
          Use um e-mail exclusivo: contas de paciente ou psicólogo <strong>não podem</strong> ser convertidas em administrador.
        </div>
        {field('fullName', 'Nome completo',
          <input id="admin-fullName" name="fullName" type="text" maxLength={150} className={inputClass} autoComplete="off" />)}
        {field('email', 'E-mail',
          <input id="admin-email" name="email" type="email" maxLength={254} className={inputClass} autoComplete="off" />)}
        {field('cpf', 'CPF',
          <input id="admin-cpf" type="text" inputMode="numeric" value={cpf} maxLength={14}
            onChange={(e) => setCpf(formatCpf(e.target.value))} className={inputClass} autoComplete="off" />)}
        {field('temporaryPassword', 'Senha temporária',
          <input id="admin-temporaryPassword" name="temporaryPassword" type="password" maxLength={128}
            className={inputClass} autoComplete="new-password" />,
          'Repasse por um canal seguro. A troca é obrigatória no primeiro acesso e ela não vai no e-mail.')}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
            {isPending ? 'Criando…' : 'Criar administrador'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
