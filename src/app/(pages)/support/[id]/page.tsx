import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMyTicketAction } from '@/actions/tickets';
import { TicketConversation } from '@/components/Organism/TicketConversation';

export const metadata: Metadata = { title: 'Chamado | Psiconet' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupportTicketPage({ params }: Props) {
  const { id } = await params;
  const { data, error, status } = await getMyTicketAction(id);
  if (status === 404 || status === 400) notFound();

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Link href="/support" className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start">← Meus chamados</Link>
        {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
        {data && <TicketConversation initial={data} mode="user" />}
      </div>
    </div>
  );
}
