'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { RoleEnum, translateRole } from "@/enums/RoleEnum";
import { useState } from "react";
import Link from "next/link";

export function FormRegister() {
    // Controla quem está sendo cadastrado. Inicia como PATIENT por padrão.
    const [role, setRole] = useState<RoleEnum.PATIENT | RoleEnum.PSYCHOLOGIST>(RoleEnum.PATIENT);

    const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
    }

    return(
        <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6">
            <div className="w-full align-center justify-center flex flex-col text-center">
                <h1 className="text-4xl">Psiconet</h1>
                <p className="text-2xl">Cadastro</p>
            </div>

            <div className="flex justify-center gap-8 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-lg">
                    <input 
                        type="radio" 
                        name="userRole" 
                        value={RoleEnum.PATIENT}
                        checked={role === RoleEnum.PATIENT}
                        onChange={() => setRole(RoleEnum.PATIENT)}
                        className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                    />
                    Paciente
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-lg">
                    <input 
                        type="radio" 
                        name="userRole" 
                        value={RoleEnum.PSYCHOLOGIST}
                        checked={role === RoleEnum.PSYCHOLOGIST}
                        onChange={() => setRole(RoleEnum.PSYCHOLOGIST)}
                        className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                    />
                    Psicólogo
                </label>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" name="email" inputType="email" />
                    <InputLabel fieldName="CPF" name="cpf" inputType="text" />
                    
                    {role === RoleEnum.PSYCHOLOGIST && (
                        <InputLabel fieldName="CRP" name="crp" inputType="text" />
                    )}
                    
                    <InputLabel fieldName="Data de Nascimento" name="datebirth" inputType="date" />
                    <InputLabel fieldName="Senha" name="password" inputType="password" />
                    <InputLabel fieldName="Repita a senha" name="repeatPassword" inputType="password" />
                </div>

                <div className="flex flex-col text-center w-full gap-4">
                    <div className="flex flex-col whitespace-nowrap">
                        <Link href="/login" className="text-base italic hover:text-[var(--primary)] transition-colors">
                            Já possui cadastro? Faça login
                        </Link>
                    </div>
                </div>

                {/* O botão atualiza o texto dinamicamente usando sua função translateRole */}
                <Button variant="tertiary" type="submit">Cadastrar {translateRole(role)}</Button>
            </form>
        </div>
    );
}