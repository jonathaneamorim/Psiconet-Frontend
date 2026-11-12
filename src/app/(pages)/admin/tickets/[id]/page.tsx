import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminTicketAction } from '@/actions/tickets';
import { TicketConversation } from '@/components/Organism/TicketConversation';

export const metadata: Metadata = { title: 'Chamado | Psiconet Admin' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: Props) {
  const { id } = await params;
  const { data, error, status } = await getAdminTicketAction(id);
  if (status === 404 || status === 400) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <Link href="/admin/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start">← Todos os chamados</Link>
        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
        {data && <TicketConversation initial={data} mode="admin" />}
      </div>
    </div>
  );
}
