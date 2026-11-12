import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminDashboardAction } from '@/actions/admin';
import { AdminDashboardCharts } from '@/components/Organism/AdminDashboardCharts';
import { AdminPageHeader } from '@/components/Organism/AdminPageHeader';

export const metadata: Metadata = {
  title: 'Dashboard | Psiconet Admin',
};

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default async function DashboardAdmin() {
  const { data, error } = await getAdminDashboardAction();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminPageHeader
          section="Dashboard"
          title="Visão geral da plataforma"
          description={data ? `Atualizado em ${dateTime.format(new Date(data.generatedAt))}.` : 'Indicadores agregados — sem dados pessoais ou clínicos.'}
          actions={
            <div className="flex gap-2">
              <Link href="/admin/users" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl">Usuários</Link>
              <Link href="/admin/tickets" className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl">Chamados</Link>
            </div>
          }
        />

        {error && (
          <div role="alert" className="px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            Não foi possível carregar os indicadores: {error}
          </div>
        )}
        {data && <AdminDashboardCharts data={data} />}
      </div>
    </div>
  );
}
