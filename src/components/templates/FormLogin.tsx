'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { useState } from "react";
import { loginAction, forgotPasswordAction } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormLoginProps {
    /** Vindo de /login?cadastro=sucesso — exibe confirmação do cadastro recém-concluído */
    registered?: boolean;
    /** E-mail recém-cadastrado, para pré-preencher o campo */
    initialEmail?: string;
}

export function FormLogin({ registered = false, initialEmail = "" }: FormLoginProps) {
    const router = useRouter();
    const [view, setView] = useState<'login' | 'recover'>('login');
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [recoverSent, setRecoverSent] = useState(false);
    const [recoverEmail, setRecoverEmail] = useState("");

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const keepLoggedIn = formData.get("keeploggedin") === "on";

        setErrorMessage("");
        const toastId = toast.loading("Realizando login...");

        const result = await loginAction(formData, keepLoggedIn);

        if (result?.success && result.redirectTo) {
            toast.success("Login realizado!", { id: toastId });
            // Botão segue desabilitado até a navegação concluir (evita duplo envio).
            router.push(result.redirectTo);
            router.refresh();
            return;
        }

        const message = result?.error ?? "Não foi possível fazer login.";
        setErrorMessage(message);
        toast.error(message, { id: toastId });
        setLoading(false);
    }

    const resetRecoverView = () => {
        setErrorMessage("");
        setRecoverSent(false);
        setRecoverEmail("");
    }

    const handleRecover = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("emailRecover")?.toString().trim() || "";

        const toastId = toast.loading("Enviando link de redefinição...");
        const result = await forgotPasswordAction(email);
        setLoading(false);

        if (result.error) {
            toast.error(result.error, { id: toastId });
            setErrorMessage(result.error);
            return;
        }

        toast.success("Verifique seu e-mail!", { id: toastId });
        setRecoverEmail(email);
        setRecoverSent(true);
    }

    if (view === 'recover') {
        if (recoverSent) {
            return (
                <div className="w-full flex flex-col gap-8 text-center">
                    <div className="flex flex-col gap-2 items-center">
                        <div className="w-14 h-14 rounded-full bg-blue-50 text-[var(--primary)] flex items-center justify-center mb-2">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Verifique seu e-mail</h2>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Se <strong>{recoverEmail}</strong> estiver cadastrado, você receberá um e-mail com um link para redefinir sua senha. O link expira em 30 minutos.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={resetRecoverView}
                            className="text-sm italic cursor-pointer hover:text-[var(--primary)] transition-colors"
                        >
                            Não recebeu? Tentar novamente
                        </button>
                        <button
                            type="button"
                            onClick={() => { resetRecoverView(); setView('login'); }}
                            className="text-sm italic cursor-pointer"
                        >
                            Voltar para o login
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full flex flex-col gap-8 text-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Recuperar Senha</h2>
                    <p className="text-sm text-gray-500">
                        Digite seu e-mail para receber um link de redefinição de senha (válido por 30 minutos).
                    </p>
                </div>

                <form onSubmit={handleRecover} className="flex flex-col gap-6">
                    <InputLabel
                        fieldName="Email"
                        name="emailRecover"
                        inputType="email"
                        required
                        error={errorMessage}
                        onClearError={() => setErrorMessage("")}
                    />

                    <div className="flex flex-col gap-3">
                        <Button variant="tertiary" type="submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                        <button
                            type="button"
                            onClick={() => { resetRecoverView(); setView('login'); }}
                            className="text-sm italic cursor-pointer"
                        >
                            Voltar para o login
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Acesso Plataforma</h2>
                <p className="text-slate-500 text-lg">Faça login para continuar sua jornada.</p>
            </div>

            {registered && (
                <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Conta criada com sucesso! Entre com seu e-mail e senha para começar.</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-4" aria-busy={loading}>
                {errorMessage && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" name="email" inputType="email" autoComplete="email" defaultValue={initialEmail} required />
                    <InputLabel fieldName="Senha" name="password" inputType="password" autoComplete="current-password" required />
                </div>

                <div className="flex flex-col text-center w-full gap-4">
                    <div className="flex gap-2 justify-center">
                        <input className="w-4" type="checkbox" name="keeploggedin" id="keeploggedin" />
                        <label htmlFor="keeploggedin">Manter login</label>
                    </div>

                    <button type="button" onClick={() => { setErrorMessage(''); setView('recover'); }} className="text-sm italic cursor-pointer hover:text-[var(--primary)] transition-colors">
                        Esqueceu a senha?
                    </button>
                </div>

                <div className="flex flex-col text-center w-full gap-4 pt-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Acessando...' : 'Acessar'}
                    </Button>

                    <div className="flex flex-col gap-2 mt-4 text-sm text-slate-600">
                        <p>
                            Não possui cadastro?{' '}
                            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
