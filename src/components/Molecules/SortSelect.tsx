'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'fullName', label: 'Nome' },
  { value: 'email', label: 'E-mail' },
  { value: 'role', label: 'Perfil' },
  { value: 'status', label: 'Status' },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? 'fullName';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '0');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="sort-select" className="text-xs text-slate-400 hidden sm:block">
        Ordenar por
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
