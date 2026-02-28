import { Header } from "@/components/Organism/Header";
import { FormRegister } from "@/components/Organism/FormRegister";

export default function PacienteCadastro() {
    return(
        <div className="min-h-screen w-full flex justify-center items-center px-4 py-10">
            <div className="relative w-full max-w-[500px] overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col pt-10 h-full relative z-10">
                    <Header />
                    <main className="flex-1 flex items-center justify-center p-2">
                        <FormRegister registerType="Psicologo" />
                    </main>
                </div>
            </div>
        </div>
    );
}