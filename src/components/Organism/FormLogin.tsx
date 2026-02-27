import { InputLabel } from "../Molecules/InputLabel";
import { Button } from "../Atoms/Button";

export function FormLogin({loginType}: {loginType: string}) {

    const type = loginType.toLocaleLowerCase().trim();

    return (
        <div className="w-full bg-[var(--secondary)] px-5 py-5 rounded-3xl shadow-md flex justify-center align-center flex-col gap-6">
            <div className="w-full align-center justify-center flex flex-col text-center">
                <h1 className="text-4xl">Psiconet</h1>
                <p className="text-2xl">Login - {loginType}</p>
            </div>

            <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <InputLabel fieldName="Email" htmlFor="email" inputType="email" />
                    {type === "psicologo" && <InputLabel fieldName="CRP" htmlFor="password" />}
                    <InputLabel fieldName="Senha" htmlFor="password" inputType="password" />
                </div>

                {type !== "admin" && 
                    <div className="flex flex-col text-center w-full gap-4">
                        <div className="flex gap-2 justify-center">
                            <input className="w-4" type="checkbox" name="keeploggedin" id="keeploggedin" />
                            <label htmlFor="keeploggedin">Manter login</label>
                        </div>
                        <div className="flex flex-col whitespace-nowrap">
                            <a href="/" className="text-base italic">Ainda não possui cadastro?</a>
                            <a href="/" className="text-base italic">Esqueceu a senha?</a>
                        </div>
                    </div>
                }

                <Button variant="tertiary" children="Entrar" type="submit"  />
            </form>
        </div>
    );
}