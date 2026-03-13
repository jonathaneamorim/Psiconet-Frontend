import { cookies } from 'next/headers';
import { RoleEnum } from '@/enums/RoleEnum';

export async function getUserRole(): Promise<RoleEnum | null> {
    const token = (await cookies()).get('psiconet_token')?.value;
    
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        return decodedPayload.role
            .replace('ROLE_', '')
            .toLowerCase() as RoleEnum;
    } catch (error) {
        return null;
    }
}