import Link from "next/link";
import { CookiePreferencesButton } from "../Atoms/CookiePreferencesButton";

const LINK = "rounded text-slate-600 underline-offset-2 hover:text-[var(--primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";

/** Rodapé global: documentos legais, preferências de cookies e aviso de emergência. */
export function Footer() {
    return (
        <footer className="print:hidden border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 lg:px-8">
                <nav aria-label="Documentos legais">
                    <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        <li><Link href="/terms" className={LINK}>Termos de Uso</Link></li>
                        <li><Link href="/privacy" className={LINK}>Política de Privacidade</Link></li>
                        <li><Link href="/cookies" className={LINK}>Política de Cookies</Link></li>
                        <li><CookiePreferencesButton className={`${LINK} cursor-pointer`} /></li>
                    </ul>
                </nav>
                <p className="text-xs leading-relaxed text-slate-500">
                    A Psiconet não é um serviço de emergência. Em crise, ligue para o <strong>CVV — 188</strong> (24 h, gratuito) ou o <strong>SAMU — 192</strong>.
                </p>
                <p className="text-xs text-slate-400">© {new Date().getFullYear()} Psiconet</p>
            </div>
        </footer>
    );
}
