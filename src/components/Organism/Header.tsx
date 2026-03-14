'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "../Atoms/Button";
import { RoleEnum } from "@/enums/RoleEnum";
import { logoutAction } from "@/actions/logout";

interface HeaderProps {
    userRole: RoleEnum | null;
}

export function Header({ userRole }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logoutAction();
    };

    const renderNavItems = () => {
        if (!userRole) {
            return (
                <>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Início</Link>
                    </li>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/about" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Sobre</Link>
                    </li>
                    <li className="lg:hidden mt-4">
                        <Link href="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="primary" className="w-full mb-2">Entrar</Button>
                        </Link>
                    </li>
                    <li className="lg:hidden">
                        <Link href="/register" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="secondary" className="w-full">Cadastrar</Button>
                        </Link>
                    </li>
                </>
            );
        }

        if (userRole === RoleEnum.PSYCHOLOGIST) {
            return (
                <>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/psychologist/dashboard" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    </li>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/psychologist/pacientes" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Meus Pacientes</Link>
                    </li>
                    <li className="text-red-400 hover:text-red-500 lg:ml-4 transition-colors">
                        <button onClick={handleLogout} className="block w-full text-center lg:text-left py-2 lg:py-0 cursor-pointer">
                            Sair
                        </button>
                    </li>
                </>
            );
        }

        if (userRole === RoleEnum.PATIENT) {
            return (
                <>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/patient/dashboard" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    </li>
                    <li className="hover:text-[var(--primary)] text-white lg:text-[var(--tertiary)] transition-colors">
                        <Link href="/patient/consultas" className="block w-full text-center lg:text-left py-2 lg:py-0" onClick={() => setIsMenuOpen(false)}>Minhas Consultas</Link>
                    </li>
                    <li className="text-red-400 hover:text-red-500 lg:ml-4 transition-colors">
                        <button onClick={handleLogout} className="block w-full text-center lg:text-left py-2 lg:py-0 cursor-pointer">
                            Sair
                        </button>
                    </li>
                </>
            );
        }
    };

    return (
        <header className="w-full h-18 bg-[var(--secondary)] fixed top-0 left-0 px-4 z-50 shadow-lg">
            <div className="container w-full h-full mx-auto flex items-center justify-between">
                
                <div className="flex-shrink-0 z-50">
                    <Link href="/">
                        <h1 className="text-2xl font-bold">Psiconet</h1>
                    </Link>
                </div>

                <nav className="hidden lg:flex items-center gap-6">
                    <ul className="flex items-center gap-6">
                        {renderNavItems()}
                    </ul>
                    {!userRole && (
                        <div className="flex gap-4 ml-4">
                            <Link href="/login">
                                <Button variant="primary">Entrar</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="secondary">Cadastrar</Button>
                            </Link>
                        </div>
                    )}
                </nav>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-2 text-slate-300 hover:text-white z-50 focus:outline-none"
                    aria-label="Menu"
                >
                    <div className="w-6 h-5 flex flex-col justify-between items-center">
                        <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
                        <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                        <span className={`block w-full h-0.5 bg-[var(--tertiary)] rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>

                <div className={`absolute top-18 left-0 w-full lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 ${
                    isMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                    <nav className="px-4">
                        <ul className="flex flex-col gap-4">
                            {renderNavItems()}
                        </ul>
                    </nav>
                </div>

            </div>
        </header>
    );
}