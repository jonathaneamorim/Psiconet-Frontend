import { FormResetPassword } from "@/components/templates/FormResetPassword";
import { validateResetTokenAction } from "@/actions/auth";

export const metadata = {
    title: "Redefinir Senha | Psiconet",
    description: "Escolha uma nova senha para sua conta Psiconet.",
};

interface Props {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
    const params = await searchParams;
    const token = params.token?.trim() || "";

    // Verifica o link recebido por e-mail antes de abrir a tela de troca de senha:
    // um link expirado/inválido nunca deve chegar a exibir o formulário de nova senha.
    const linkValid = Boolean(token)
        ? (await validateResetTokenAction(token)).valid
        : false;

    return (
        <FormResetPassword token={token} linkValid={linkValid} />
    );
}
