'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  linkId: string;
}

/**
 * Exportação do PDF de guarda pelo psicólogo. Por padrão só o registro documental; a caixa inclui
 * as anotações pessoais (documento sigiloso). Baixa via fetch para exibir erro amigável (ex.: 429).
 */
export function RecordPdfExport({ linkId }: Props) {
  const [includePrivate, setIncludePrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const response = await fetch(`/api/medical-records/links/${encodeURIComponent(linkId)}/pdf?includePrivateNotes=${includePrivate}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? 'Não foi possível gerar o PDF.');
        return;
      }
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'prontuario.pdf';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF gerado. A exportação foi registrada na auditoria.');
    } catch {
      toast.error('Erro de conexão ao gerar o PDF.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={includePrivate} onChange={(e) => setIncludePrivate(e.target.checked)} className="w-4 h-4" />
        Incluir anotações pessoais
      </label>
      <button type="button" onClick={download} disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-60">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
        </svg>
        {loading ? 'Gerando…' : 'Exportar PDF'}
      </button>
    </div>
  );
}
