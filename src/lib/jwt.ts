import { RoleEnum } from "@/enums/RoleEnum";
import { ROLE_PREFIX } from "@/constants/cookies";
import type { JwtPayload } from "@/types/auth";

/*
 * Funções puras (sem next/headers) — usáveis tanto no proxy.ts quanto no servidor.
 * ATENÇÃO: apenas DECODIFICAM o token para decidir navegação; quem valida assinatura, expiração,
 * status do usuário e permissões é sempre o backend.
 */

function base64UrlDecode(segment: string): string {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
}

export function decodeTokenPayload(token: string): JwtPayload | null {
    try {
        const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
        return typeof payload?.role === 'string' ? payload as JwtPayload : null;
    } catch {
        return null;
    }
}

/** true se o token tem `exp` no passado (com folga, padrão 5 s). */
export function isTokenExpired(token: string, nowMs: number = Date.now(), marginMs: number = 5000): boolean {
    const payload = decodeTokenPayload(token);
    if (!payload) return true;
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 <= nowMs + marginMs;
}

/**
 * Decodifica um JWT e retorna a role do usuário formatada (ex: "ROLE_PATIENT" → "patient").
 *
 * @returns A role como RoleEnum, ou null se o token for inválido ou expirado.
 */
export function decodeRoleFromToken(token: string): RoleEnum | null {
    const payload = decodeTokenPayload(token);
    if (!payload || isTokenExpired(token)) return null;
    const role = payload.role.replace(ROLE_PREFIX, '').toLowerCase();
    return (Object.values(RoleEnum) as string[]).includes(role) ? role as RoleEnum : null;
}
