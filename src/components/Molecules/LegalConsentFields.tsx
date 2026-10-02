'use client';

import Link from "next/link";
import { useId } from "react";

interface Props {
    /** Paciente: inclui o consentimento destacado de dados de saúde (LGPD art. 11, I). */
    includeHealthData: boolean;
    termsVersion: string;
    privacyVersion: string;
    errors?: Record<string, string>;
    onClearError?: (field: string) => void;
}

const LINK = "font-semibold text-[var(--primary)] underline underline-offset-2 hover:no-underline";

/**
 * Checkboxes de aceite (cadastro e reaceite). Nunca pré-marcados. Os links abrem em nova aba para
 * não perder o preenchimento. As versões vão em campos ocultos: o backend recusa versão desatualizada.
 */
export function LegalConsentFields({ includeHealthData, termsVersion, privacyVersion, errors = {}, onClearError }: Props) {
    const termsId = useId();
    const healthId = useId();

    return (
        <fieldset className="flex flex-col gap-3 text-left">
            <legend className="sr-only">Aceite dos documentos legais</legend>
            <input type="hidden" name="termsVersion" value={termsVersion} />
            <input type="hidden" name="privacyVersion" value={privacyVersion} />

            <div>
                <div className="flex items-start gap-3">
                    <input
                        id={termsId}
                        name="acceptTerms"
                        type="checkbox"
                        className="mt-1 h-4 w-4 flex-shrink-0 accent-[var(--primary)]"
                        aria-invalid={!!errors.acceptTerms}
                        aria-describedby={errors.acceptTerms ? `${termsId}-error` : undefined}
                        onChange={() => onClearError?.("acceptTerms")}
                    />
                    <label htmlFor={termsId} className="text-sm text-slate-700 leading-relaxed">
                        Li e concordo com os{" "}
                        <Link href="/terms" target="_blank" rel="noopener" className={LINK}>Termos de Uso</Link>{" "}
                        e a{" "}
                        <Link href="/privacy" target="_blank" rel="noopener" className={LINK}>Política de Privacidade</Link>
                        <span className="sr-only"> (abrem em nova aba)</span>.
                    </label>
                </div>
                {errors.acceptTerms && <p id={`${termsId}-error`} role="alert" className="mt-1 pl-7 text-sm text-red-600">{errors.acceptTerms}</p>}
            </div>

            {includeHealthData && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                    <div className="flex items-start gap-3">
                        <input
                            id={healthId}
                            name="acceptHealthData"
                            type="checkbox"
                            className="mt-1 h-4 w-4 flex-shrink-0 accent-[var(--primary)]"
                            aria-invalid={!!errors.acceptHealthData}
                            aria-describedby={`${healthId}-hint${errors.acceptHealthData ? ` ${healthId}-error` : ""}`}
                            onChange={() => onClearError?.("acceptHealthData")}
                        />
                        <label htmlFor={healthId} className="text-sm text-slate-800 leading-relaxed">
                            <strong>Autorizo o tratamento dos meus dados de saúde</strong> pela Psiconet para conectar-me a psicólogos,
                            organizar minha agenda e permitir que o psicólogo mantenha meu prontuário.
                        </label>
                    </div>
                    <p id={`${healthId}-hint`} className="mt-1.5 pl-7 text-xs text-slate-600">
                        Saber que você faz acompanhamento psicológico é um dado sensível. Ele é protegido e você pode revogar esta autorização
                        a qualquer momento (veja a <Link href="/privacy#9-seus-direitos-lgpd-art-18" target="_blank" rel="noopener" className={LINK}>Política de Privacidade</Link>).
                    </p>
                    {errors.acceptHealthData && <p id={`${healthId}-error`} role="alert" className="mt-1 pl-7 text-sm text-red-600">{errors.acceptHealthData}</p>}
                </div>
            )}
        </fieldset>
    );
}
