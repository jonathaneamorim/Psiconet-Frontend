'use client';

import Link from 'next/link';
import { RoleEnum } from '@/enums/RoleEnum';
import { logoutAction } from '@/actions/logout';
import toast from 'react-hot-toast';

interface LateralMenuProps {
    userRole: RoleEnum | null;
}

export function LateralMenu({ userRole }: LateralMenuProps) {
    if (!userRole) return null;

    const dashboardLink = `/${userRole}/dashboard`;

    const handleLogout = async () => {
        toast.success("Logout realizado com sucesso.");
        await logoutAction();
    };

    return (
        <aside
            className="hidden lg:flex fixed top-18 left-0 h-[calc(100vh-4.5rem)] w-16 hover:w-96 bg-white/80 backdrop-blur-md border-r border-slate-200/60 transition-all duration-300 z-40 group overflow-hidden shadow-sm flex-col"
            data-testid="lateral-menu"
        >
            <nav className="flex-1 py-6 px-2 flex flex-col gap-2">

                {/* Dashboard - Real Link */}
                <Link
                    href={dashboardLink}
                    className="flex items-center gap-3 px-2 py-3 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                    title="Dashboard"
                >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Dashboard
                    </span>
                </Link>

                {/* Consultas / Pacientes - Mocked Link */}
                <Link
                    href="#"
                    className="flex items-center gap-3 px-2 py-3 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                    title={userRole === RoleEnum.PSYCHOLOGIST ? "Meus Pacientes" : "Minhas Consultas"}
                >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {userRole === RoleEnum.PSYCHOLOGIST ? "Pacientes (Em breve)" : "Consultas (Em breve)"}
                    </span>
                </Link>

                {/* Configurações - Mocked Link */}
                <Link
                    href="#"
                    className="flex items-center gap-3 px-2 py-3 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                    title="Configurações"
                >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Configurações (Em breve)
                    </span>
                </Link>

            </nav>

            <div className="p-3 border-t border-slate-200/60 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-2 py-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all whitespace-nowrap"
                    title="Sair"
                >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Sair
                    </span>
                </button>
            </div>
        </aside>
    );
}
