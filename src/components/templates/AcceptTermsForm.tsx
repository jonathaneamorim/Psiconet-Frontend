'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "../Atoms/Button";
import { LegalConsentFields } from "../Molecules/LegalConsentFields";
import { acceptTermsAction } from "@/actions/legal";
import { logoutAction } from "@/actions/logout";
import type { ConsentStatus } from "@/types/legal";

interface Props {
    status: ConsentStatus;
    includeHealthData: boolean;
}

export function AcceptTermsForm({ status, includeHealthData }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const firstAcceptance = status.pending.includes('TERMS') && status.pending.includes('PRIVACY');

    const clearError = (field: string) => setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
    });

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const local: Record<string, string> = {};
        if (formData.get("acceptTerms") !== "on") local.acceptTerms = "Marque a caixa para concordar com os documentos.";
        if (includeHealthData && formData.get("acceptHealthData") !== "on") {
            local.acceptHealthData = "Para continuar como paciente, autorize o tratamento dos seus dados de saúde.";
        }
        if (Object.keys(local).length > 0) {
            setErrors(local);
            return;
        }

        setLoading(true);
        const result = await acceptTermsAction(formData);
        if (result.success && result.redirectTo) {
            toast.success("Aceite registrado. Obrigado!");
            router.push(result.redirectTo);
            router.refresh();
            return;
        }
        setErrors(result.fields ?? {});
        toast.error(result.error ?? "Não foi possível registrar o aceite.");
        if (result.code === "LEGAL_VERSION_OUTDATED") router.refresh();
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {firstAcceptance ? "Antes de continuar" : "Atualizamos nossos documentos"}
                </h1>
                <p className="mt-2 text-slate-600 leading-relaxed">
                    {firstAcceptance
                        ? "Para usar a Psiconet, leia e aceite os documentos abaixo."
                        : "Publicamos uma nova versão. Leia as mudanças — o histórico fica no fim de cada documento — e confirme o aceite para continuar."}
                </p>
            </div>

            <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <span className="font-medium text-slate-900">Termos de Uso <span className="font-normal text-slate-500">· versão {status.termsVersion}</span></span>
                    <Link href="/terms" target="_blank" rel="noopener" className="font-semibold text-[var(--primary)] underline underline-offset-2">Ler<span className="sr-only"> os Termos de Uso (nova aba)</span></Link>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <span className="font-medium text-slate-900">Política de Privacidade <span className="font-normal text-slate-500">· versão {status.privacyVersion}</span></span>
                    <Link href="/privacy" target="_blank" rel="noopener" className="font-semibold text-[var(--primary)] underline underline-offset-2">Ler<span className="sr-only"> a Política de Privacidade (nova aba)</span></Link>
                </li>
            </ul>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={loading} noValidate>
                <LegalConsentFields
                    includeHealthData={includeHealthData}
                    termsVersion={status.termsVersion}
                    privacyVersion={status.privacyVersion}
                    errors={errors}
                    onClearError={clearError}
                />
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Aceitar e continuar"}
                </Button>
            </form>

            <button
                type="button"
                onClick={() => logoutAction()}
                className="text-sm text-slate-600 underline underline-offset-2 hover:text-slate-900"
            >
                Não concordo — sair da conta
            </button>
        </div>
    );
}
