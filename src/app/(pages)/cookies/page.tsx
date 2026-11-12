import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/Organism/LegalDocumentView";
import { getLegalDocument } from "@/services/legalService";

export const metadata: Metadata = {
    title: "Política de Cookies · Psiconet",
    description: "Cookies usados pela Psiconet e como gerenciar seu consentimento.",
};

// Pública para logados e deslogados (rota compartilhada no proxy.ts).
export default async function Page() {
    const document = await getLegalDocument('cookies');
    return <LegalDocumentView slug="cookies" fallbackTitle="Política de Cookies" document={document} />;
}
