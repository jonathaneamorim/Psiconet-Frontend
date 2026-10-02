import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/Organism/LegalDocumentView";
import { getLegalDocument } from "@/services/legalService";

export const metadata: Metadata = {
    title: "Política de Privacidade · Psiconet",
    description: "Como a Psiconet trata seus dados pessoais.",
};

// Pública para logados e deslogados (rota compartilhada no proxy.ts).
export default async function Page() {
    const document = await getLegalDocument('privacy');
    return <LegalDocumentView slug="privacy" fallbackTitle="Política de Privacidade" document={document} />;
}
