'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminDashboard } from '@/types/admin';

/*
 * Paleta validada (skill dataviz, validate_palette.js — modo claro): azul #2a78d6 e laranja #eb6834,
 * CVD ΔE e normal-vision acima dos limites. Identidade nunca depende só de cor: cada barra tem
 * rótulo de eixo + valor escrito, e cada gráfico tem uma tabela equivalente.
 */
const SERIES_1 = '#2a78d6';
const SERIES_2 = '#eb6834';
const GRID = '#e2e8f0';
const AXIS_TEXT = '#475569';

interface Datum {
  label: string;
  value: number;
  color: string;
}

function ChartCard({ title, description, data, total }: { title: string; description: string; data: Datum[]; total?: string }) {
  const empty = data.every((d) => d.value === 0);
  const titleId = `chart-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <section aria-labelledby={titleId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-sm font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        {total && <span className="text-2xl font-bold text-slate-900 tabular-nums">{total}</span>}
      </header>

      {empty ? (
        <div className="h-48 flex items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
          Ainda não há dados para exibir.
        </div>
      ) : (
        <div className="h-48" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} stroke={GRID} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={130} tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                formatter={(value) => [String(value), 'Quantidade']}
                contentStyle={{ borderRadius: 12, borderColor: GRID, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={false}>
                {data.map((d) => <Cell key={d.label} fill={d.color} />)}
                <LabelList dataKey="value" position="right" fill="#0f172a" fontSize={12} fontWeight={600} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Equivalente textual (leitores de tela, impressão, daltonismo) */}
      <table className="w-full text-xs">
        <caption className="sr-only">{title}</caption>
        <tbody className="divide-y divide-slate-100">
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row" className="py-1.5 text-left font-normal text-slate-600">
                <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2 align-middle" style={{ backgroundColor: d.color }} aria-hidden="true" />
                {d.label}
              </th>
              <td className="py-1.5 text-right font-semibold text-slate-800 tabular-nums">{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">{value.toLocaleString('pt-BR')}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function AdminDashboardCharts({ data }: { data: AdminDashboard }) {
  const { tickets } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="Usuários totais" value={data.totalUsers} hint={`${data.activeUsers} ativos · ${data.inactiveUsers} inativos/bloqueados`} />
        <StatTile label="Psicólogos ativos" value={data.activePsychologists} hint={`de ${data.totalPsychologists} cadastrados`} />
        <StatTile label="Pacientes ativos" value={data.activePatients} hint={`de ${data.totalPatients} cadastrados`} />
        <StatTile label="Chamados abertos" value={tickets.pending} hint={`${tickets.open} aguardando · ${tickets.inProgress} em atendimento`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Psicólogos e pacientes ativos"
          description="Contas com situação ativa, por perfil."
          data={[
            { label: 'Psicólogos ativos', value: data.activePsychologists, color: SERIES_1 },
            { label: 'Pacientes ativos', value: data.activePatients, color: SERIES_1 },
          ]}
        />
        <ChartCard
          title="Usuários totais"
          description="Todas as contas cadastradas, por perfil."
          total={data.totalUsers.toLocaleString('pt-BR')}
          data={[
            { label: 'Pacientes', value: data.totalPatients, color: SERIES_1 },
            { label: 'Psicólogos', value: data.totalPsychologists, color: SERIES_1 },
            { label: 'Administradores', value: data.totalAdmins, color: SERIES_1 },
          ]}
        />
        <ChartCard
          title="Chamados abertos × resolvidos"
          description="Abertos = aguardando ou em atendimento; resolvidos = resolvidos ou encerrados."
          data={[
            { label: 'Abertos', value: tickets.pending, color: SERIES_2 },
            { label: 'Resolvidos', value: tickets.finished, color: SERIES_1 },
          ]}
        />
      </div>
    </div>
  );
}
