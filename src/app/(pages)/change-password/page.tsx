import type { Metadata } from "next";
import { FormChangePassword } from "@/components/templates/FormChangePassword";

export const metadata: Metadata = {
    title: "Alterar senha | Psiconet",
};

interface Props {
    searchParams: Promise<{ obrigatoria?: string }>;
}

export default async function ChangePasswordPage({ searchParams }: Props) {
    const { obrigatoria } = await searchParams;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-24 pb-12">
            <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                <FormChangePassword required={obrigatoria === "1"} />
            </div>
        </div>
    );
}
