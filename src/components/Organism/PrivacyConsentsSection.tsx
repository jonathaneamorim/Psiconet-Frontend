'use client';

import Link from "next/link";
import { useState } from "react";
import { CookiePreferencesButton } from "../Atoms/CookiePreferencesButton";
import { ConfirmModal } from "../Molecules/ConfirmModal";
import { logoutAllDevicesAction } from "@/actions/logout";
import { formatDateTime } from "@/lib/datetime";
import { CONSENT_ITEM_LABELS, CONSENT_SOURCE_LABELS, type ConsentRecord } from "@/types/legal";

const RIGHTS = [
    "Confirmar se tratamos seus dados e acessá-los",
    "Corrigir dados incompletos ou desatualizados (boa parte direto nesta página)",
    "Pedir anonimização, bloqueio ou eliminação de dados desnecessários",
    "Pedir a portabilidade dos seus dados",
    "Revogar consentimentos e pedir a eliminação do que depende deles (respeitada a guarda legal do prontuário)",
    "Saber com quem compartilhamos seus dados",
];

/** "Privacidade e consentimentos" nas configurações de paciente e psicólogo. */
export function PrivacyConsentsSection({ history }: { history: ConsentRecord[] | null }) {
    const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

    return (
        <section aria-labelledby="privacy-title" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-6">
            <div>
                <h2 id="privacy-title" className="text-lg font-semibold text-slate-800">Privacidade e consentimentos</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Veja o que você aceitou, ajuste cookies e saiba como exercer seus direitos (LGPD).
                </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800">Documentos aceitos</h3>
                {history === null ? (
                    <p className="mt-2 text-sm text-slate-500">Não foi possível carregar o histórico agora.</p>
                ) : history.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">Nenhum aceite registrado.</p>
                ) : (
                    <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[28rem] text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th scope="col" className="px-3 py-2 font-medium">Documento</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Versão</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Data</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Origem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {history.map((h, i) => (
                                    <tr key={`${h.type}-${h.version}-${i}`}>
                                        <td className="px-3 py-2">{CONSENT_ITEM_LABELS[h.type] ?? h.type}</td>
                                        <td className="px-3 py-2">{h.version}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(h.acceptedAt)}</td>
                                        <td className="px-3 py-2">{CONSENT_SOURCE_LABELS[h.source] ?? h.source}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="mt-2 text-xs text-slate-500">
                    Leia as versões vigentes: <Link href="/terms" className="underline">Termos de Uso</Link> ·{" "}
                    <Link href="/privacy" className="underline">Política de Privacidade</Link> ·{" "}
                    <Link href="/cookies" className="underline">Política de Cookies</Link>
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-800">Cookies</h3>
                <p className="text-sm text-slate-600">Usamos apenas cookies estritamente necessários. Você pode rever sua escolha a qualquer momento.</p>
                <CookiePreferencesButton className="self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50" />
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-800">Seus direitos</h3>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {RIGHTS.map((r) => <li key={r}>{r}</li>)}
                </ul>
                <p className="text-sm text-slate-600">
                    Para exercer qualquer um deles, abra um chamado na categoria <strong>Privacidade / LGPD</strong>.
                    O acesso ao seu prontuário é pedido na área de Prontuário.
                </p>
                <Link href="/support/new?categoria=PRIVACY" className="self-start rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--secondary)] hover:bg-[var(--primary-hover)]">
                    Abrir pedido de privacidade
                </Link>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-800">Sessões</h3>
                <p className="text-sm text-slate-600">Encerre o acesso em todos os computadores e celulares conectados à sua conta, inclusive este.</p>
                <button type="button" onClick={() => setConfirmLogoutAll(true)}
                    className="self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                    Sair de todos os dispositivos
                </button>
            </div>

            {confirmLogoutAll && (
                <ConfirmModal
                    title="Sair de todos os dispositivos?"
                    description="Todas as sessões serão encerradas, inclusive esta. Você precisará entrar novamente."
                    confirmLabel="Sair de todos"
                    confirmVariant="danger"
                    onConfirm={() => logoutAllDevicesAction()}
                    onClose={() => setConfirmLogoutAll(false)}
                />
            )}
        </section>
    );
}
