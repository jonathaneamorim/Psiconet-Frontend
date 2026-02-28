'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { useState } from "react";
import { loginAction } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function FormLogin({loginType}: {loginType: string}) {
    const [errorMessage, setErrorMessage] = useState("");
    const type = loginType.toLocaleLowerCase().trim() as 'admin' | 'psicologo' | 'paciente';
    const router = useRouter();
    const [view, setView] = useState<'login' | 'recover'>('login');

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault(); 

        const formData = new FormData(e.currentTarget);
        const keepLoggedIn = formData.get("keeploggedin") === "on";
        
        setErrorMessage("");
        const toastId = toast.loading("Realizando login...");

        const result = await loginAction(formData, type, keepLoggedIn);
        
        if(result?.error) {
            setErrorMessage(result.error);
            toast.error(result.error, { id: toastId }); 
        } else if (result?.success) {
            toast.success("Usuário logado!", { id: toastId });
            router.push(result.redirectTo);
        }
    }

    const handleRecover = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success(`Link de recuperação enviado para o e-mail do ${loginType}!`);
        setView('login');
    }

    if (view === 'recover') {
        return (
            <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6 text-center">
                <h2 className="text-2xl">Recuperar Senha</h2>
                <p className="text-sm text-gray-500">Digite seu e-mail para receber as instruções de acesso para {loginType}.</p>
                
                <form onSubmit={handleRecover} className="flex flex-col gap-6">
                    <InputLabel fieldName="Email" htmlFor="emailRecover" inputType="email" />
                    
                    <div className="flex flex-col gap-3">
                        <Button variant="tertiary" children="Enviar Link" type="submit" />
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
                <p className="text-2xl">Login - {loginType}</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" htmlFor="email" inputType="email" />
                    <InputLabel fieldName="Senha" htmlFor="password" inputType="password" />
                </div>

                {type !== "admin" && 
                    <div className="flex flex-col text-center w-full gap-4">
                        <div className="flex gap-2 justify-center">
                            <input className="w-4" type="checkbox" name="keeploggedin" id="keeploggedin" />
                            <label htmlFor="keeploggedin">Manter login</label>
                        </div>
                        <div className="flex flex-col whitespace-nowrap">
                            <a href={`/${type}/cadastro`} className="text-base italic">Ainda não possui cadastro?</a>
                            <button type="button" onClick={() => setView('recover')} className="text-base italic cursor-pointer text-center">
                                Esqueceu a senha?
                            </button>
                        </div>
                    </div>
                }

                <Button variant="tertiary" children="Entrar" type="submit"  />
            </form>
        </div>
    );
}