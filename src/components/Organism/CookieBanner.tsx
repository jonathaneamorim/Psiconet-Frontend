'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { ModalShell } from "../Molecules/ModalShell";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { COOKIE_CATEGORIES, type CookieCategory } from "@/lib/cookieConsent";

// Mesmo destaque visual para as três ações (aceitar não pode ser mais chamativo que rejeitar).
const ACTION = "w-full sm:w-auto rounded-xl border border-slate-800 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:opacity-60";

/**
 * Aviso de cookies (primeiro acesso, nova versão da política ou reabertura pelo rodapé) e modal
 * de personalização por categoria. Não bloqueia o uso do site.
 */
export function CookieBanner() {
    const { bannerVisible, preferencesOpen, saving, error, acceptAll, rejectOptional, openPreferences } = useCookieConsent();
    const titleId = useId();
    const descId = useId();

    return (
        <>
            {bannerVisible && (
                <section
                    role="region"
                    aria-labelledby={titleId}
                    aria-describedby={descId}
                    className="print:hidden fixed inset-x-0 bottom-0 z-[55] p-4 sm:p-6"
                >
                    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
                        <h2 id={titleId} className="text-base font-semibold text-slate-900">Cookies na Psiconet</h2>
                        <p id={descId} className="mt-1.5 text-sm leading-relaxed text-slate-700">
                            Usamos apenas cookies <strong>estritamente necessários</strong> para manter você conectado com segurança e lembrar esta escolha.
                            Não usamos cookies de estatística, publicidade ou de terceiros. Saiba mais na{" "}
                            <Link href="/cookies" className="text-[var(--primary)] underline underline-offset-2">Política de Cookies</Link>.
                        </p>
                        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button type="button" className={ACTION} onClick={rejectOptional} disabled={saving}>Rejeitar não essenciais</button>
                            <button type="button" className={ACTION} onClick={openPreferences} disabled={saving}>Personalizar</button>
                            <button type="button" className={ACTION} onClick={acceptAll} disabled={saving}>Aceitar todos</button>
                        </div>
                    </div>
                </section>
            )}
            {preferencesOpen && <CookiePreferencesModal />}
        </>
    );
}

function CookiePreferencesModal() {
    const { consent, saving, error, save, closePreferences, rejectOptional, acceptAll } = useCookieConsent();
    // O modal é montado a cada abertura: parte sempre da escolha vigente.
    const [selected, setSelected] = useState<Set<CookieCategory>>(() => new Set(consent?.categories ?? ['necessary']));

    const toggle = (id: CookieCategory) => setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    return (
        <ModalShell title="Preferências de cookies" subtitle="Escolha por categoria" onClose={closePreferences} widthClass="max-w-2xl">
            <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-slate-700">
                    Você pode mudar esta escolha quando quiser em <strong>“Preferências de cookies”</strong>, no rodapé.
                    Detalhes na <Link href="/cookies" className="text-[var(--primary)] underline underline-offset-2" onClick={closePreferences}>Política de Cookies</Link>.
                </p>

                <ul className="space-y-3">
                    {COOKIE_CATEGORIES.map((category) => {
                        const inputId = `cookie-cat-${category.id}`;
                        const checked = category.locked || selected.has(category.id);
                        return (
                            <li key={category.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <label htmlFor={inputId} className="font-semibold text-slate-900">{category.label}</label>
                                        <p id={`${inputId}-desc`} className="mt-1 text-sm text-slate-600">{category.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <input
                                            id={inputId}
                                            type="checkbox"
                                            className="h-5 w-5 accent-[var(--primary)] disabled:opacity-60"
                                            checked={checked}
                                            disabled={category.locked || !category.available}
                                            onChange={() => toggle(category.id)}
                                            aria-describedby={`${inputId}-desc`}
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            {category.locked ? 'Sempre ativo' : category.available ? (checked ? 'Ativo' : 'Inativo') : 'Não utilizado'}
                                        </p>
                                    </div>
                                </div>
                                {category.cookies.length > 0 && (
                                    <div className="mt-3 overflow-x-auto">
                                        <table className="w-full min-w-[28rem] text-left text-xs">
                                            <thead className="text-slate-500">
                                                <tr><th scope="col" className="py-1 pr-3 font-medium">Cookie</th><th scope="col" className="py-1 pr-3 font-medium">Finalidade</th><th scope="col" className="py-1 font-medium">Duração</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700 align-top">
                                                {category.cookies.map((c) => (
                                                    <tr key={c.name} className="border-t border-slate-100">
                                                        <td className="py-1.5 pr-3 font-mono">{c.name}</td>
                                                        <td className="py-1.5 pr-3">{c.purpose}</td>
                                                        <td className="py-1.5">{c.duration}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button type="button" className={ACTION} onClick={rejectOptional} disabled={saving}>Rejeitar não essenciais</button>
                <button type="button" className={ACTION} onClick={() => save([...selected])} disabled={saving}>Salvar escolhas</button>
                <button type="button" className={ACTION} onClick={acceptAll} disabled={saving}>Aceitar todos</button>
            </div>
        </ModalShell>
    );
}
