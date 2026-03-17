import { cookies } from 'next/headers';
import { RoleEnum } from '@/enums/RoleEnum';
import { COOKIE_TOKEN } from '@/constants/cookies';
import { decodeRoleFromToken } from '@/lib/jwt';

export async function getUserRole(): Promise<RoleEnum | null> {
    const token = (await cookies()).get(COOKIE_TOKEN)?.value;
    if (!token) return null;
    return decodeRoleFromToken(token);
}