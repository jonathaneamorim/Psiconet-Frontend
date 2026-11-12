import { FormLogin } from "@/components/templates/FormLogin";

interface Props {
    searchParams: Promise<{ cadastro?: string; email?: string; sessao?: string; saida?: string }>;
}

export default async function Login({ searchParams }: Props) {
    const params = await searchParams;
    const registered = params.cadastro === "sucesso";
    // Só pré-preenche valores com cara de e-mail (o parâmetro vem da URL)
    const email = registered && params.email && /^[^\s@]+@[^\s@]+$/.test(params.email) ? params.email : "";

    const sessionNotice = params.sessao === "expirada" ? "expired" : params.saida === "todos" ? "all-devices" : null;

    return (
        <FormLogin registered={registered} initialEmail={email} sessionNotice={sessionNotice} />
    );
}
