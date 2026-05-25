'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { useState } from "react";
import { loginAction } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function FormLogin() {
    const router = useRouter();
    const [view, setView] = useState<'login' | 'recover'>('login');
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const keepLoggedIn = formData.get("keeploggedin") === "on";

        setErrorMessage("");
        const toastId = toast.loading("Realizando login...");

        const result = await loginAction(formData, keepLoggedIn);

        if (result?.error) {
            setErrorMessage(result.error);
            toast.error(result.error, { id: toastId });
        } else if (result?.success && result.redirectTo) {
            toast.success("Usuário logado!", { id: toastId });
            router.push(result.redirectTo);
        }
        setLoading(false);
    }

    const handleRecover = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success(`Link de recuperação enviado para o e-mail!`);
        setView('login');
    }

    if (view === 'recover') {
        return (
            <div className="w-full flex flex-col gap-8 text-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Recuperar Senha</h2>
                    <p className="text-sm text-gray-500">
                        Digite seu e-mail para receber as instruções de acesso à sua conta.
                    </p>
                </div>

                <form onSubmit={handleRecover} className="flex flex-col gap-6">
                    <InputLabel fieldName="Email" name="emailRecover" inputType="email" />

                    <div className="flex flex-col gap-3">
                        <Button variant="tertiary" type="submit">Enviar Link</Button>
                        <button type="button" onClick={() => setView('login')} className="text-sm italic cursor-pointer">
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

            <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-4">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" name="email" inputType="email" />
                    <InputLabel fieldName="Senha" name="password" inputType="password" />
                </div>

                <div className="flex flex-col text-center w-full gap-4">
                    <div className="flex gap-2 justify-center">
                        <input className="w-4" type="checkbox" name="keeploggedin" id="keeploggedin" />
                        <label htmlFor="keeploggedin">Manter login</label>
                    </div>

                    <button type="button" onClick={() => setView('recover')} className="text-sm italic cursor-pointer hover:text-[var(--primary)] transition-colors">
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