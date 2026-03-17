import { RoleEnum } from "@/enums/RoleEnum";
import { ROLE_PREFIX } from "@/constants/cookies";

/**
 * Decodifica um JWT e retorna a role do usuário formatada (ex: "ROLE_PATIENT" → "patient").
 *
 * Esta função é pura e não depende de next/headers — pode ser usada tanto
 * no Edge Runtime (proxy.ts) quanto no Server Runtime (lib/auth.ts).
 *
 * @returns A role como RoleEnum, ou null se o token for inválido.
 */
export function decodeRoleFromToken(token: string): RoleEnum | null {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return decodedPayload.role
            .replace(ROLE_PREFIX, '')
            .toLowerCase() as RoleEnum;
    } catch {
        return null;
    }
}
