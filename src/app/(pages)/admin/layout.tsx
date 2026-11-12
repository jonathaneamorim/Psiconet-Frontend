import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { RoleEnum } from '@/enums/RoleEnum';
import { ROUTES } from '@/config/routes';

/*
 * Segunda camada de guarda da área admin (a primeira é o proxy.ts). Só reflete a regra: quem
 * realmente bloqueia é o backend (/admin/** exige ROLE_ADMIN + @PreAuthorize).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const role = await getUserRole();
    if (role !== RoleEnum.ADMIN) {
        redirect(role ? `/${role}/dashboard` : ROUTES.LOGIN);
    }
    return <>{children}</>;
}
