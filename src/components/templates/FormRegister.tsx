'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";
import { RoleEnum, translateRole } from "@/enums/RoleEnum";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerAction } from "@/actions/register";
import { useRouter } from "next/navigation";

export function FormRegister() {
    const [role, setRole] = useState<RoleEnum.PATIENT | RoleEnum.PSYCHOLOGIST>(RoleEnum.PATIENT);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const clearFieldError = (field: string) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password")?.toString() ?? "";
        const repeatPassword = formData.get("repeatPassword")?.toString() ?? "";
        const passwordMismatch = password !== repeatPassword;

        setLoading(true);
        const toastId = toast.loading("Realizando cadastro...");

        const result = await registerAction(formData);

        const backendFields = result?.fields ?? {};
        const mergedErrors = {
            ...backendFields,
            ...(passwordMismatch && { repeatPassword: "As senhas não coincidem." }),
        };

        if (Object.keys(mergedErrors).length > 0) {
            setFieldErrors(mergedErrors);
            toast.error(result?.error || "Corrija os campos destacados.", { id: toastId });
        } else if (result?.error) {
            toast.error(result.error, { id: toastId });
        } else if (result?.success && result.redirectTo) {
            toast.success("Usuário registrado com sucesso!", { id: toastId });
            router.push(result.redirectTo);
        }
        setLoading(false);
    }

    return (
        <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6">
            <div className="w-full align-center justify-center flex flex-col text-center">
                <h1 className="text-4xl">Psiconet</h1>
                <p className="text-2xl">Cadastro</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-6">
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

                <div className="flex flex-col gap-3">
                    <InputLabel 
                        fieldName="Email" 
                        name="email" 
                        inputType="email" 
                        error={fieldErrors["email"]}
                        onClearError={() => clearFieldError("email")}
                    />
                    <InputLabel 
                        fieldName="CPF" 
                        name="cpf" 
                        inputType="text" 
                        error={fieldErrors["cpf"]}
                        onClearError={() => clearFieldError("cpf")}
                    />

                    {role === RoleEnum.PSYCHOLOGIST && (
                        <InputLabel 
                            fieldName="CRP" 
                            name="crp" 
                            inputType="text" 
                            error={fieldErrors["crp"]}
                            onClearError={() => clearFieldError("crp")}
                        />
                    )}

                    <InputLabel 
                        fieldName="Data de Nascimento" 
                        name="birthDate" 
                        inputType="date" 
                        error={fieldErrors["birthDate"]}
                        onClearError={() => clearFieldError("birthDate")}
                    />
                    <InputLabel 
                        fieldName="Senha" 
                        name="password" 
                        inputType="password" 
                        error={fieldErrors["password"]}
                        onClearError={() => clearFieldError("password")}
                    />
                    <InputLabel 
                        fieldName="Repita a senha" 
                        name="repeatPassword" 
                        inputType="password" 
                        error={fieldErrors["repeatPassword"]}
                        onClearError={() => clearFieldError("repeatPassword")}
                    />
                </div>

                <div className="flex flex-col text-center w-full gap-4">
                    <div className="flex flex-col whitespace-nowrap">
                        <Link href="/login" className="text-base italic hover:text-[var(--primary)] transition-colors">
                            Já possui cadastro? Faça login
                        </Link>
                    </div>
                </div>

                <Button variant="tertiary" type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar ' + translateRole(role)}</Button>
            </form>
        </div>
    );
}