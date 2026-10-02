import Link from "next/link";
import { Fragment } from "react";
import type { Block, Inline } from "@/lib/markdown";

/*
 * Renderiza a árvore de lib/markdown como elementos React (sem HTML bruto). Marcadores
 * "[A PREENCHER: ...]" ficam destacados para a equipe completar antes da publicação.
 */

const PLACEHOLDER = /(\[A PREENCHER:[^\]]*\])/g;
const IS_PLACEHOLDER = /^\[A PREENCHER:[^\]]*\]$/;

function Text({ value }: { value: string }) {
    const parts = value.split(PLACEHOLDER);
    return (
        <>
            {parts.map((part, i) =>
                IS_PLACEHOLDER.test(part) ? (
                    <mark key={i} className="rounded bg-amber-100 px-1 text-amber-900">{part}</mark>
                ) : (
                    <Fragment key={i}>{part}</Fragment>
                )
            )}
        </>
    );
}

function InlineNodes({ nodes }: { nodes: Inline[] }) {
    return (
        <>
            {nodes.map((node, i) => {
                switch (node.type) {
                    case 'text':
                        return <Text key={i} value={node.value} />;
                    case 'strong':
                        return <strong key={i} className="font-semibold text-slate-900"><InlineNodes nodes={node.children} /></strong>;
                    case 'em':
                        return <em key={i}><InlineNodes nodes={node.children} /></em>;
                    case 'code':
                        return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-800 break-all">{node.value}</code>;
                    case 'link':
                        if (node.href.startsWith('/') || node.href.startsWith('#')) {
                            return <Link key={i} href={node.href} className="text-[var(--primary)] underline underline-offset-2 hover:no-underline"><InlineNodes nodes={node.children} /></Link>;
                        }
                        return (
                            <a key={i} href={node.href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline underline-offset-2 hover:no-underline">
                                <InlineNodes nodes={node.children} />
                            </a>
                        );
                }
            })}
        </>
    );
}

export function LegalMarkdown({ blocks }: { blocks: Block[] }) {
    return (
        <>
            {blocks.map((block, i) => {
                switch (block.type) {
                    case 'heading': {
                        const className = block.level === 2
                            ? "scroll-mt-28 text-xl sm:text-2xl font-bold text-slate-900 mt-10 mb-3"
                            : "scroll-mt-28 text-lg font-semibold text-slate-900 mt-6 mb-2";
                        const Tag = (`h${block.level}`) as 'h2' | 'h3' | 'h4';
                        return <Tag key={i} id={block.id} className={className}><InlineNodes nodes={block.children} /></Tag>;
                    }
                    case 'paragraph':
                        return <p key={i} className="my-3 leading-relaxed text-slate-700"><InlineNodes nodes={block.children} /></p>;
                    case 'list': {
                        const Tag = block.ordered ? 'ol' : 'ul';
                        return (
                            <Tag key={i} className={`my-3 space-y-1.5 pl-6 text-slate-700 leading-relaxed ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
                                {block.items.map((item, j) => <li key={j}><InlineNodes nodes={item} /></li>)}
                            </Tag>
                        );
                    }
                    case 'table':
                        return (
                            <div key={i} className="my-4 overflow-x-auto rounded-xl border border-slate-200" role="region" aria-label="Tabela" tabIndex={0}>
                                <table className="w-full min-w-[32rem] text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-900">
                                        <tr>{block.header.map((cell, j) => <th key={j} scope="col" className="px-3 py-2 font-semibold"><InlineNodes nodes={cell} /></th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {block.rows.map((row, j) => (
                                            <tr key={j}>{row.map((cell, k) => <td key={k} className="px-3 py-2 align-top"><InlineNodes nodes={cell} /></td>)}</tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    case 'quote':
                        return (
                            <aside key={i} className="my-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-1 text-amber-950">
                                <LegalMarkdown blocks={block.children} />
                            </aside>
                        );
                }
            })}
        </>
    );
}
