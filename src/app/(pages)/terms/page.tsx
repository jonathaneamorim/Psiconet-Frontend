import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/Organism/LegalDocumentView";
import { getLegalDocument } from "@/services/legalService";

export const metadata: Metadata = {
    title: "Termos de Uso · Psiconet",
    description: "Regras de uso da plataforma Psiconet.",
};

// Pública para logados e deslogados (rota compartilhada no proxy.ts).
export default async function Page() {
    const document = await getLegalDocument('terms');
    return <LegalDocumentView slug="terms" fallbackTitle="Termos de Uso" document={document} />;
}
