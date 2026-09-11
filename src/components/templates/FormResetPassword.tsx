'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { useState } from "react";
import { resetPasswordAction } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
    token: string;
    linkValid: boolean;
}

export function FormResetPassword({ token, linkValid }: Props) {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const linkIsInvalid = !token || !linkValid;

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get("newPassword")?.toString() || "";
        const confirmPassword = formData.get("confirmPassword")?.toString() || "";

        if (newPassword !== confirmPassword) {
            setErrorMessage("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Redefinindo senha...");
        const result = await resetPasswordAction(token, newPassword);
        setLoading(false);

        if (result.error) {
            toast.error(result.error, { id: toastId });
            setErrorMessage(result.error);
            return;
        }

        toast.success("Senha redefinida com sucesso!", { id: toastId });
        setSuccess(true);
    }

    if (linkIsInvalid) {
        return (
            <div className="w-full flex flex-col gap-6 text-center items-center">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Link inválido</h2>
                    <p className="text-sm text-gray-500 max-w-sm">
                        Este link de redefinição de senha está incompleto, expirado ou já foi utilizado. Solicite um novo link para continuar.
                    </p>
                </div>
                <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Voltar para o login
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="w-full flex flex-col gap-6 text-center items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Senha redefinida!</h2>
                    <p className="text-sm text-gray-500 max-w-sm">
                        Sua senha foi alterada com sucesso. Faça login com a nova senha para continuar.
                    </p>
                </div>
                <Button variant="primary" onClick={() => router.push('/login')}>
                    Ir para o login
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Nova Senha</h2>
                <p className="text-slate-500">
                    Escolha uma nova senha para sua conta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
                <InputLabel
                    fieldName="Nova Senha"
                    name="newPassword"
                    inputType="password"
                    required
                    error={errorMessage}
                    onClearError={() => setErrorMessage("")}
                />
                <InputLabel fieldName="Confirmar Nova Senha" name="confirmPassword" inputType="password" required />

                <div className="flex flex-col text-center w-full gap-4 pt-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </Button>

                    <Link href="/login" className="text-sm italic hover:text-[var(--primary)] transition-colors">
                        Voltar para o login
                    </Link>
                </div>
            </form>
        </div>
    );
}
