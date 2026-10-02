import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getConsentStatusAction } from "@/actions/legal";
import { getUserRole } from "@/lib/auth";
import { ROUTES } from "@/config/routes";
import { RoleEnum } from "@/enums/RoleEnum";
import { AcceptTermsForm } from "@/components/templates/AcceptTermsForm";

export const metadata: Metadata = { title: "Atualização dos termos · Psiconet" };

/*
 * Reaceite obrigatório (ADR 013 do backend): enquanto houver pendência, o backend responde
 * CONSENT_REQUIRED em toda a API e o apiClient traz o usuário para cá. Ler os documentos e sair
 * da conta continuam disponíveis.
 */
export default async function AcceptTermsPage() {
    const role = await getUserRole();
    if (!role) redirect(ROUTES.LOGIN);

    const { data: status, error } = await getConsentStatusAction();
    if (status && !status.consentRequired) redirect(`/${role}/dashboard`);

    return (
        <div className="w-full min-h-screen bg-slate-50 pt-28 pb-24 px-4">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
                {status ? (
                    <AcceptTermsForm
                        status={status}
                        includeHealthData={role === RoleEnum.PATIENT && status.pending.includes('HEALTH_DATA')}
                    />
                ) : (
                    <p role="alert" className="text-slate-700">{error ?? "Não foi possível carregar os documentos. Recarregue a página."}</p>
                )}
            </div>
        </div>
    );
}
