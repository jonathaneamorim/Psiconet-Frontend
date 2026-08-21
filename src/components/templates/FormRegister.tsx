'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { CpfInput } from "../Molecules/CpfInput";
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
        const fullName = formData.get("fullName")?.toString().trim() ?? "";
        const password = formData.get("password")?.toString() ?? "";
        const repeatPassword = formData.get("repeatPassword")?.toString() ?? "";
        const passwordMismatch = password !== repeatPassword;

        const frontendErrors: Record<string, string> = {};
        if (fullName.length < 3) {
            frontendErrors.fullName = "Nome completo deve ter pelo menos 3 caracteres.";
        }
        if (passwordMismatch) {
            frontendErrors.repeatPassword = "As senhas não coincidem.";
        }

        if (Object.keys(frontendErrors).length > 0) {
            setFieldErrors(frontendErrors);
            toast.error("Corrija os campos destacados.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Realizando cadastro...");

        const result = await registerAction(formData);

        const backendFields = result?.fields ?? {};

        if (Object.keys(backendFields).length > 0) {
            setFieldErrors(backendFields);
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
        <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Crie sua Conta</h2>
                <p className="text-slate-500 text-lg">Junte-se a nós para cuidar da sua saúde mental.</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-5 mt-2">
                <input type="hidden" name="userRole" value={role} />
                {/* Segmented Control para o Tipo de Conta */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
                    <button
                        type="button"
                        onClick={() => setRole(RoleEnum.PATIENT)}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                            role === RoleEnum.PATIENT 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        Sou Paciente
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole(RoleEnum.PSYCHOLOGIST)}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                            role === RoleEnum.PSYCHOLOGIST 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        Sou Psicólogo
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <InputLabel 
                        fieldName="Nome Completo" 
                        name="fullName" 
                        inputType="text" 
                        error={fieldErrors["fullName"]}
                        onClearError={() => clearFieldError("fullName")}
                    />
                    <InputLabel 
                        fieldName="Email" 
                        name="email" 
                        inputType="email" 
                        error={fieldErrors["email"]}
                        onClearError={() => clearFieldError("email")}
                    />
                    <CpfInput
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

                <div className="flex flex-col text-center w-full gap-4 pt-4">
                    <Button variant="primary" type="submit" className="shadow-md hover:scale-105" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Criar conta como ' + translateRole(role)}
                    </Button>
                    
                    <div className="flex flex-col gap-2 mt-2 text-sm text-slate-600">
                        <p>
                            Já possui cadastro?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}