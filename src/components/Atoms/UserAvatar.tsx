'use client';

import { useState } from "react";

interface UserAvatarProps {
    photoUrl?: string | null;
    name?: string | null;
    /** Classes de tamanho/borda do círculo (ex.: "w-9 h-9 ring-2 ring-white shadow-sm"). */
    className?: string;
    /** Classes do ícone padrão (sem foto). */
    iconClassName?: string;
}

/** Foto do usuário em círculo; sem foto (ou se a imagem falhar) mostra o ícone padrão de pessoa. */
export function UserAvatar({ photoUrl, name, className = "w-9 h-9", iconClassName = "w-5 h-5" }: UserAvatarProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const showPhoto = !!photoUrl && failedUrl !== photoUrl;

    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-[var(--primary)] ${className}`}>
            {showPhoto ? (
                <img
                    src={photoUrl}
                    alt={name ? `Foto de ${name}` : "Foto do usuário"}
                    className="w-full h-full object-cover"
                    onError={() => setFailedUrl(photoUrl)}
                />
            ) : (
                <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )}
        </div>
    );
}
