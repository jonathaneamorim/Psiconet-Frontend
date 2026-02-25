'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
    const router = useRouter();

    return (
        <header className="w-full h-18 bg-[var(--secondary)] flex items-center justify-between fixed top-0 left-0 px-4 z-50">
            <div className="flex-shrink-0">
                <Link href="/">
                    <h1 className="text-2xl font-bold">Psiconet</h1>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {isHomePage ? (
                    <div className="flex items-center gap-2 flex-nowrap">
                        <Button variant="primary" onClick={() => router.push('/psicologo/login')}>
                            Psicólogo
                        </Button>
                        <Button variant="primary" onClick={() => router.push('/paciente/login')}>
                            Paciente
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg transition-colors focus:outline-none"
                        aria-label="Menu">
                        <div className="w-6 h-5 flex flex-col justify-between items-center">
                            <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
                            <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                            <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </div>
                    </button>
                )}
            </div>

            <div
                className={`absolute top-18 left-0 w-full lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 ${
                    isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
            >
                <nav className="p-4">
                    <ul className="flex flex-col gap-4 text-white">
                        <li className="hover:text-[var(--primary)] cursor-pointer">Início</li>
                        <li className="hover:text-[var(--primary)] cursor-pointer">Sobre</li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}