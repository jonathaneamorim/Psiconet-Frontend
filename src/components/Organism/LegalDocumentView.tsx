import Link from "next/link";
import { LegalMarkdown } from "../Atoms/LegalMarkdown";
import { PrintButton } from "../Atoms/PrintButton";
import { parseMarkdown, tableOfContents } from "@/lib/markdown";
import { formatPlainDate } from "@/lib/datetime";
import type { LegalDocument, LegalSlug } from "@/types/legal";

const OTHER_DOCUMENTS: { slug: LegalSlug; href: string; label: string }[] = [
    { slug: 'terms', href: '/terms', label: 'Termos de Uso' },
    { slug: 'privacy', href: '/privacy', label: 'Política de Privacidade' },
    { slug: 'cookies', href: '/cookies', label: 'Política de Cookies' },
];

interface Props {
    slug: LegalSlug;
    fallbackTitle: string;
    document: LegalDocument | null;
}

/** Página pública de documento legal: cabeçalho com versão/vigência, sumário navegável e conteúdo. */
export function LegalDocumentView({ slug, fallbackTitle, document }: Props) {
    if (!document) {
        return (
            <div className="w-full min-h-screen bg-slate-50 pt-28 pb-24 px-4">
                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">{fallbackTitle}</h1>
                    <p role="alert" className="mt-3 text-slate-600">
                        Não foi possível carregar o documento agora. Tente novamente em alguns instantes.
                    </p>
                </div>
            </div>
        );
    }

    const blocks = parseMarkdown(document.content);
    const toc = tableOfContents(blocks);

    return (
        <div className="w-full min-h-screen bg-slate-50 pt-24 pb-24 print:bg-white print:pt-0">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--primary)]">Psiconet · Documentos legais</p>
                        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{document.title}</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Versão <strong>{document.version}</strong> · Vigente desde <strong>{formatPlainDate(document.effectiveDate)}</strong>
                        </p>
                    </div>
                    <PrintButton />
                </header>

                <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
                    <nav aria-label="Sumário" className="print:hidden lg:sticky lg:top-24 lg:self-start">
                        <details className="group rounded-2xl border border-slate-200 bg-white p-4 lg:open:block" open>
                            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 flex items-center justify-between">
                                Sumário
                                <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
                            </summary>
                            <ol className="mt-3 space-y-1.5 text-sm">
                                {toc.map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`} className="block rounded px-1 text-slate-600 hover:text-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                                            {item.text}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </details>
                        <ul className="mt-4 space-y-1.5 px-1 text-sm">
                            {OTHER_DOCUMENTS.filter((d) => d.slug !== slug).map((d) => (
                                <li key={d.slug}>
                                    <Link href={d.href} className="text-slate-600 underline underline-offset-2 hover:text-[var(--primary)]">{d.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-10 text-base print:border-0 print:p-0">
                        <LegalMarkdown blocks={blocks} />
                    </article>
                </div>
            </div>
        </div>
    );
}
