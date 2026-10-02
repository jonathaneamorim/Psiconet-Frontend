export default function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12" aria-busy="true" aria-live="polite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <span className="sr-only">Carregando indicadores…</span>
        <div className="h-8 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <div key={i} className="h-80 bg-white border border-slate-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}
