'use client';

import dynamic from 'next/dynamic';
import type { CallExperienceProps } from './CallExperience';

// O SDK de vídeo (livekit-client + componentes) só é baixado nesta página e só no navegador.
const CallExperience = dynamic(() => import('./CallExperience').then((m) => m.CallExperience), {
  ssr: false,
  loading: () => (
    <div className="max-w-5xl mx-auto py-16 flex flex-col items-center gap-3 text-slate-500" role="status">
      <span className="w-8 h-8 border-2 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" aria-hidden="true" />
      <span className="text-sm">Preparando a sala de vídeo…</span>
    </div>
  ),
});

export function CallLoader(props: CallExperienceProps) {
  return <CallExperience {...props} />;
}
