'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "../Atoms/Button";
import { RoleEnum } from "@/enums/RoleEnum";
import { logoutAction } from "@/actions/logout";
import { NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserAvatar } from "../Atoms/UserAvatar";
import type { HeaderUser } from "@/actions/profile";
import toast from "react-hot-toast";

interface HeaderProps {
    userRole: RoleEnum | null;
    /** Nome e foto do usuário logado (null para admin ou se o perfil não carregar). */
    user?: HeaderUser | null;
}

export function Header({ userRole, user = null }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        toast.success("Logout realizado com sucesso.");
        await logoutAction();
    };

    const isPatient = userRole === RoleEnum.PATIENT;
    const isPsychologist = userRole === RoleEnum.PSYCHOLOGIST;
    const isAdmin = userRole === RoleEnum.ADMIN;

    const roleLabel = isPatient ? 'Paciente' : isPsychologist ? 'Psicólogo' : 'Administrador';
    const accountName = user?.fullName?.trim() || 'Minha Conta';
    const roleAccessLabel = isPatient ? 'Acesso Paciente' : isPsychologist ? 'Acesso Psicólogo' : 'Acesso Administrador';

    const navItems = userRole ? (NAV_ITEMS[userRole] ?? []) : [];
    // Paciente ainda não tem página de configurações própria (ver NAV_ITEMS).
    const settingsHref = isPsychologist ? '/psychologist/settings' : isPatient ? '/patient/settings' : null;
    // Suporte: pacientes e psicólogos abrem chamados; o admin atende em /admin/tickets.
    const supportHref = isPatient || isPsychologist ? ROUTES.SUPPORT : null;
    const profileHref = isAdmin ? ROUTES.ADMIN_DASHBOARD : `/${userRole}/profile`;

    return (
        <header className="print:hidden w-full h-18 bg-white/80 backdrop-blur-md fixed top-0 left-0 px-4 sm:px-8 z-50 border-b border-slate-200/60 shadow-sm transition-all">
            <div className="container w-full h-full mx-auto flex items-center justify-between">

                {/* Logo */}
                <div className="flex-shrink-0 z-50">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="/siteIcons/apple-touch-icon.png"
                            alt="Psiconet Logo"
                            className="w-8 h-8 transition-all bg-transparent"
                        />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                            Psiconet
                        </h1>
                    </Link>
                </div>

                {/* Desktop Navigation & Profile */}
                <nav className="hidden lg:flex items-center gap-8">
                    {!userRole ? (
                        <>
                            <ul className="flex items-center gap-8 text-sm font-medium text-slate-600">
                                <li>
                                    <Link href="/" className="hover:text-[var(--primary)] transition-colors">Início</Link>
                                </li>
                                <li>
                                    <Link href="/about" className="hover:text-[var(--primary)] transition-colors">Sobre</Link>
                                </li>
                            </ul>
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                <Link href="/login">
                                    <button className="text-sm font-medium text-slate-700 hover:text-[var(--primary)] transition-colors px-4 py-2">
                                        Entrar
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" className="shadow-md hover:shadow-lg transition-all text-sm px-5 py-2.5 rounded-full">
                                        Cadastrar
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <NotificationsDropdown userRole={userRole} />
                            <div className="h-6 w-px bg-slate-200"></div>
                            <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
                                aria-label="Menu do Usuário"
                                aria-haspopup="menu"
                                aria-expanded={isProfileOpen}
                            >
                                <UserAvatar photoUrl={user?.photoUrl} name={user?.fullName} className="w-9 h-9 ring-2 ring-white shadow-sm" />
                                <div className="flex flex-col items-start hidden sm:flex">
                                    <span className="text-sm font-semibold text-slate-700 leading-tight max-w-[10rem] truncate">{accountName}</span>
                                    <span className="text-xs text-slate-500 font-medium">{roleLabel}</span>
                                </div>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu Desktop */}
                            <div className={`absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50 origin-top-right transition-all duration-200 ${isProfileOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                    <p className="text-sm font-medium text-slate-900 truncate">Sessão Ativa</p>
                                    <p className="text-xs text-slate-500 truncate">{roleAccessLabel}</p>
                                </div>
                                <ul className="py-2 text-sm text-slate-600 font-medium">
                                    <li>
                                        <Link href={profileHref} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[var(--primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Meu Perfil
                                        </Link>
                                    </li>
                                    <li>
                                        {settingsHref ? (
                                            <Link href={settingsHref} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[var(--primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Configurações
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-2.5 text-slate-300 cursor-not-allowed">
                                                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Configurações <span className="text-xs font-normal ml-1">(Em breve)</span>
                                            </div>
                                        )}
                                    </li>
                                    <li>
                                        <Link href={ROUTES.CHANGE_PASSWORD} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[var(--primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            Alterar senha
                                        </Link>
                                    </li>
                                    {supportHref && (
                                        <li>
                                            <Link href={supportHref} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 hover:text-[var(--primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Suporte · Meus chamados
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                                <div className="border-t border-slate-100 py-2">
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sair da Conta
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                    )}
                </nav>

                {/* Mobile: Notifications icon + Hamburger Button */}
                <div className="lg:hidden flex items-center gap-1 z-50">
                    {userRole && <NotificationsDropdown userRole={userRole} />}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                        aria-label="Menu"
                    >
                        <div className="w-6 h-5 flex flex-col justify-between items-center overflow-hidden">
                            <span className={`block w-full h-[2px] bg-current transform transition-all duration-300 origin-left ${isMenuOpen ? "rotate-45 translate-x-px" : ""}`} />
                            <span className={`block w-full h-[2px] bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0 translate-x-4" : "opacity-100"}`} />
                            <span className={`block w-full h-[2px] bg-current transform transition-all duration-300 origin-left ${isMenuOpen ? "-rotate-45 translate-x-px" : ""}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`absolute top-18 left-0 w-full lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 shadow-xl ${isMenuOpen ? 'max-h-[calc(100vh-4.5rem)] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}>
                    <div className="p-6 flex flex-col h-full max-h-[80vh] overflow-y-auto">
                        {!userRole ? (
                            <div className="flex flex-col gap-6">
                                <ul className="flex flex-col gap-4 text-base font-medium text-slate-700">
                                    <li><Link href="/" className="block py-2 hover:text-[var(--primary)]" onClick={() => setIsMenuOpen(false)}>Início</Link></li>
                                    <li><Link href="/about" className="block py-2 hover:text-[var(--primary)]" onClick={() => setIsMenuOpen(false)}>Sobre</Link></li>
                                </ul>
                                <div className="h-px bg-slate-100 w-full"></div>
                                <div className="flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="secondary" className="w-full justify-center">Entrar</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="primary" className="w-full justify-center shadow-md">Cadastrar</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Mobile User Info */}
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <UserAvatar photoUrl={user?.photoUrl} name={user?.fullName} className="w-12 h-12 shadow-inner" iconClassName="w-6 h-6" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{accountName}</p>
                                        <p className="text-xs text-slate-500">{roleLabel}</p>
                                    </div>
                                </div>

                                {/* Mobile Navigation */}
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Navegação</h3>
                                    {navItems.map((item) => {
                                        if (item.comingSoon) {
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 cursor-not-allowed font-medium"
                                                >
                                                    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                                                    <span>{item.label} <span className="text-xs font-normal">(Em breve)</span></span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span className="w-5 h-5 flex-shrink-0 text-slate-400">{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="h-px bg-slate-100 w-full my-1"></div>

                                {/* Mobile Profile Actions */}
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Opções de Perfil</h3>
                                    <Link href={profileHref} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Meu Perfil
                                    </Link>
                                    {settingsHref ? (
                                        <Link href={settingsHref} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Configurações
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 cursor-not-allowed font-medium">
                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Configurações <span className="text-xs font-normal">(Em breve)</span>
                                        </div>
                                    )}

                                    {supportHref && (
                                        <Link href={supportHref} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Suporte · Meus chamados
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sair da Conta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}