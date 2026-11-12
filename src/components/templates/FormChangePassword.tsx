'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { changePasswordAction } from "@/actions/auth";
import { validatePassword } from "@/lib/password";

interface Props {
    /** true quando o acesso veio de uma senha temporária (troca obrigatória) */
    required?: boolean;
}

export function FormChangePassword({ required = false }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const clearError = (field: string) => setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
    });

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get("newPassword")?.toString() ?? "";
        const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

        const errors: Record<string, string> = {};
        const policyError = validatePassword(newPassword);
        if (policyError) errors.newPassword = policyError;
        if (newPassword !== confirmPassword) errors.confirmPassword = "As senhas não coincidem.";
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Alterando senha...");
        const result = await changePasswordAction(formData);

        if (result.success && result.redirectTo) {
            toast.success("Senha alterada com sucesso!", { id: toastId });
            router.push(result.redirectTo);
            router.refresh();
            return;
        }

        setFieldErrors(result.fields ?? {});
        toast.error(result.error ?? "Não foi possível alterar a senha.", { id: toastId });
        setLoading(false);
    }

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {required ? "Defina sua nova senha" : "Alterar senha"}
                </h1>
                <p className="text-slate-500">
                    {required
                        ? "Por segurança, troque a senha temporária antes de continuar."
                        : "Ao alterar a senha, as sessões abertas em outros dispositivos serão encerradas."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={loading} noValidate>
                <InputLabel
                    fieldName={required ? "Senha temporária" : "Senha atual"}
                    name="currentPassword"
                    inputType="password"
                    autoComplete="current-password"
                    required
                    error={fieldErrors.currentPassword}
                    onClearError={() => clearError("currentPassword")}
                />
                <InputLabel
                    fieldName="Nova senha"
                    name="newPassword"
                    inputType="password"
                    autoComplete="new-password"
                    required
                    error={fieldErrors.newPassword}
                    onClearError={() => clearError("newPassword")}
                />
                <InputLabel
                    fieldName="Confirme a nova senha"
                    name="confirmPassword"
                    inputType="password"
                    autoComplete="new-password"
                    required
                    error={fieldErrors.confirmPassword}
                    onClearError={() => clearError("confirmPassword")}
                />
                <p className="text-xs text-slate-500">
                    Mínimo de 8 caracteres, com ao menos uma letra maiúscula e um caractere especial.
                </p>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar nova senha"}
                </Button>
            </form>
        </div>
    );
}
