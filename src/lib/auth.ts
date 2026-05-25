import { RoleEnum } from '@/enums/RoleEnum';
import { cookieService } from '@/services/cookieService';
import { decodeRoleFromToken } from '@/lib/jwt';

export async function getUserRole(): Promise<RoleEnum | null> {
    const token = await cookieService.getAuthToken();
    if (!token) return null;
    return decodeRoleFromToken(token);
}