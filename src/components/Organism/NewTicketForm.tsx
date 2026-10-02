'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { openTicketAction } from '@/actions/tickets';
import { TICKET_CATEGORY_LABEL, TICKET_LIMITS, type TicketCategory } from '@/types/ticket';

const inputClass =
  'w-full px-4 py-3 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

export function NewTicketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory | ''>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!category) local.category = 'Escolha uma categoria.';
    if (subject.trim().length < TICKET_LIMITS.subjectMin) local.subject = `O assunto deve ter ao menos ${TICKET_LIMITS.subjectMin} caracteres.`;
    if (description.trim().length < TICKET_LIMITS.descriptionMin) local.description = `Descreva o problema com ao menos ${TICKET_LIMITS.descriptionMin} caracteres.`;
    if (Object.keys(local).length) { setErrors(local); return; }

    setLoading(true);
    const result = await openTicketAction({ category: category as TicketCategory, subject: subject.trim(), description: description.trim() });

    if (result.success && result.redirectTo) {
      toast.success('Chamado aberto! Você será avisado quando houver resposta.');
      router.push(result.redirectTo);
      return;
    }
    setErrors(result.fields ?? {});
    toast.error(result.error ?? 'Não foi possível abrir o chamado.');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={loading} noValidate>
      <div>
        <label htmlFor="ticket-category" className="block text-sm font-semibold text-slate-700 mb-1.5">Categoria</label>
        <select id="ticket-category" value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className={inputClass} aria-invalid={errors.category ? true : undefined}>
          <option value="">Selecione…</option>
          {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map((c) => (
            <option key={c} value={c}>{TICKET_CATEGORY_LABEL[c]}</option>
          ))}
        </select>
        {errors.category && <p role="alert" className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="ticket-subject" className="block text-sm font-semibold text-slate-700 mb-1.5">Assunto</label>
        <input id="ticket-subject" value={subject} maxLength={TICKET_LIMITS.subjectMax} onChange={(e) => setSubject(e.target.value)}
          className={inputClass} placeholder="Resuma o problema em uma frase" aria-invalid={errors.subject ? true : undefined} />
        <div className="flex justify-between mt-1">
          {errors.subject ? <p role="alert" className="text-xs text-red-600">{errors.subject}</p> : <span />}
          <span className="text-xs text-slate-400">{subject.length}/{TICKET_LIMITS.subjectMax}</span>
        </div>
      </div>

      <div>
        <label htmlFor="ticket-description" className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
        <textarea id="ticket-description" value={description} maxLength={TICKET_LIMITS.descriptionMax} rows={7}
          onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-y`}
          placeholder="Conte o que aconteceu, quando e em qual tela." aria-invalid={errors.description ? true : undefined} />
        <div className="flex justify-between mt-1">
          {errors.description ? <p role="alert" className="text-xs text-red-600">{errors.description}</p> : <span />}
          <span className="text-xs text-slate-400">{description.length}/{TICKET_LIMITS.descriptionMax}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
        O suporte cuida de questões da plataforma (acesso, cadastro, agenda, cobranças). Não envie informações
        clínicas ou de saúde por aqui. Você pode ter até 3 chamados em aberto ao mesmo tempo.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
          {loading ? 'Enviando…' : 'Abrir chamado'}
        </button>
      </div>
    </form>
  );
}
