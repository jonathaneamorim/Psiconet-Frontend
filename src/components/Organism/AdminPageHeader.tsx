interface Props {
  section: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

/** Cabeçalho padrão das páginas administrativas (breadcrumb + título + ações). */
export function AdminPageHeader({ section, title, description, actions }: Props) {
  return (
    <div className="mb-8">
      <nav aria-label="Trilha" className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <span>Admin</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">{section}</span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        {actions}
      </div>
    </div>
  );
}
