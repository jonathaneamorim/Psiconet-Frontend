'use client';

import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";

export function FormRegister({registerType}: {registerType: string}) {
    const type = registerType.toLocaleLowerCase().trim() as 'admin' | 'psicologo' | 'paciente';

    const handleRegister = () => {
        
    }

    return(
        <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6">
            <div className="w-full align-center justify-center flex flex-col text-center">
                <h1 className="text-4xl">Psiconet</h1>
                <p className="text-2xl">Login - {registerType}</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" name="email" inputType="email" />
                    <InputLabel fieldName="CPF" name="cpf" inputType="text" />
                    {type === "psicologo" && <InputLabel fieldName="CRP" name="crp" inputType="text" />}
                    <InputLabel fieldName="Data de Nascimento" name="datebirth" inputType="date" />
                    <InputLabel fieldName="Senha" name="password" inputType="password" />
                    <InputLabel fieldName="Repita a senha" name="repeatPassword" inputType="password" />
                </div>

                {type !== "admin" && 
                    <div className="flex flex-col text-center w-full gap-4">
                        <div className="flex flex-col whitespace-nowrap">
                            <a href={`/${type}/login`} className="text-base italic">Ainda não possui cadastro?</a>
                        </div>
                    </div>
                }

                <Button variant="tertiary" children="Cadastrar" type="submit"  />
            </form>
        </div>
    );
}