import type { Metadata } from 'next';
import Link from 'next/link';
import { NewTicketForm } from '@/components/Organism/NewTicketForm';

export const metadata: Metadata = { title: 'Abrir chamado | Psiconet' };

export default function NewTicketPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <Link href="/support" className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start">← Meus chamados</Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Abrir chamado</h1>
          <p className="text-slate-600 mt-1">Descreva o problema e a equipe Psiconet responderá por aqui.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <NewTicketForm />
        </div>
      </div>
    </div>
  );
}
