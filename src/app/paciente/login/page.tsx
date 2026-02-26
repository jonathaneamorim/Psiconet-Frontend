import { InputLabel } from "@/components/Molecules/InputLabel";

export default function PacienteLogin() {
    return (
        <div>
            <h1>Login do Paciente</h1>
            <div className="p-4">
                <InputLabel fieldName="Email" htmlFor="email" />
            </div>
        </div>
    );
}