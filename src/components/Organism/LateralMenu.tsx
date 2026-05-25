'use client';

import Link from 'next/link';
import { RoleEnum } from '@/enums/RoleEnum';
import { logoutAction } from '@/actions/logout';
import { NAV_ITEMS } from '@/config/navigation';
import toast from 'react-hot-toast';

interface LateralMenuProps {
    userRole: RoleEnum | null;
}

export function LateralMenu({ userRole }: LateralMenuProps) {
    if (!userRole) return null;

    const items = NAV_ITEMS[userRole] ?? [];

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
                {items.map((item) => {
                    const inner = (
                        <>
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                                {item.label}
                                {item.comingSoon && (
                                    <span className="text-[10px] font-normal text-slate-400">(Em breve)</span>
                                )}
                            </span>
                        </>
                    );

                    if (item.comingSoon) {
                        return (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 px-2 py-3 text-slate-300 cursor-not-allowed rounded-xl whitespace-nowrap"
                                title={`${item.label} (Em breve)`}
                            >
                                {inner}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-2 py-3 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                            title={item.label}
                        >
                            {inner}
                        </Link>
                    );
                })}
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
