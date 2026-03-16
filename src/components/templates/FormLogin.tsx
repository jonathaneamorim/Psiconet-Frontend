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

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault(); 

        const formData = new FormData(e.currentTarget);
        const keepLoggedIn = formData.get("keeploggedin") === "on";
        
        setErrorMessage("");
        const toastId = toast.loading("Realizando login...");

        const result = await loginAction(formData, keepLoggedIn);
        
        if(result?.error) {
            setErrorMessage(result.error);
            toast.error(result.error, { id: toastId }); 
        } else if (result?.success && result.redirectTo) {
            toast.success("Usuário logado!", { id: toastId });
            router.push(result.redirectTo);
        }
    }

    const handleRecover = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success(`Link de recuperação enviado para o e-mail!`);
        setView('login');
    }

    if (view === 'recover') {
        return (
            <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6 text-center">
                <h2 className="text-2xl">Recuperar Senha</h2>
                <p className="text-sm text-gray-500">
                    Digite seu e-mail para receber as instruções de acesso à sua conta.
                </p>
                
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
        <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6">
            <div className="w-full align-center justify-center flex flex-col text-center">
                <h1 className="text-4xl">Psiconet</h1>
                <p className="text-2xl">Login</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" name="email" inputType="email" />
                    <InputLabel fieldName="Senha" name="password" inputType="password" />
                </div>

                <div className="flex flex-col text-center w-full gap-4">
                    <div className="flex gap-2 justify-center">
                        <input className="w-4" type="checkbox" name="keeploggedin" id="keeploggedin" />
                        <label htmlFor="keeploggedin">Manter login</label>
                    </div>
                    
                    <div className="flex flex-col whitespace-nowrap">
                        <Link href="/register" className="text-base italic hover:text-[var(--primary)] transition-colors">
                            Ainda não possui cadastro?
                        </Link>
                        <button type="button" onClick={() => setView('recover')} className="text-base italic cursor-pointer text-center hover:text-[var(--primary)] transition-colors mt-1">
                            Esqueceu a senha?
                        </button>
                    </div>
                </div>

                <Button variant="tertiary" type="submit">Entrar</Button>
            </form>
        </div>
    );
}