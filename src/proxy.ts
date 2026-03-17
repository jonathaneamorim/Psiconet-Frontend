import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RoleEnum } from "@/enums/RoleEnum";
import { ROUTES, PUBLIC_ROUTES } from "@/config/routes";
import { COOKIE_TOKEN } from "@/constants/cookies";
import { decodeRoleFromToken } from "@/lib/jwt";

export function proxy(request: NextRequest) {
    const token = request.cookies.get(COOKIE_TOKEN)?.value;
    const { pathname } = request.nextUrl;

    // 1. Define o que é rota pública/livre
    const isPublicPage = (PUBLIC_ROUTES as readonly string[]).includes(pathname);

    // 2. Lida com usuários SEM token
    if (!token) {
        return isPublicPage
            ? NextResponse.next()
            : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    // 3. Usuário COM token
    const userRole = decodeRoleFromToken(token);

    // Token inválido ou corrompido → limpa cookie e manda pro login
    if (!userRole) {
        const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
        response.cookies.delete(COOKIE_TOKEN);
        return response;
    }

    const userDashboard = `/${userRole}/dashboard`;

    // A. Já logado tentando acessar página pública → manda pro Dashboard
    if (isPublicPage) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    // B. Validação de rotas protegidas (ex: /patient/dashboard)
    // pathname "/patient/dashboard" → segments: ["", "patient", "dashboard"]
    const requestedRole = pathname.split('/')[1] as RoleEnum;

    // Rota não pertence a nenhuma role conhecida → redireciona pro dashboard
    if (!Object.values(RoleEnum).includes(requestedRole)) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    // Tentou acessar dashboard de outra role → redireciona pro dele
    if (requestedRole !== userRole) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    return NextResponse.next();
}

// ATENÇÃO: O matcher do Next.js precisa de strings literais estáticas.
// Constantes importadas de outros módulos não são resolvidas em build time no Edge Runtime.
export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/about',
        '/admin/:path*',
        '/psychologist/:path*',
        '/patient/:path*',
    ],
};