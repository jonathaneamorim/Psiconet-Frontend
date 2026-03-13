import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RoleEnum } from "@/enums/RoleEnum";

export function proxy(request: NextRequest) {
    const token = request.cookies.get('psiconet_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Define o que é rota pública/livre
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isHomePage = pathname === '/';
    const isPublicPage = isHomePage || isAuthPage || pathname === '/about';

    // 2. Lida com Usuários SEM Token
    if (!token) {
        if (isPublicPage) {
            return NextResponse.next(); 
        }
        // Se tentou acessar rota protegida sem token, manda pro login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Usuario com token
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        const userRoleFromToken = decodedPayload.role
            .replace('ROLE_', '')
            .toLowerCase() as RoleEnum;

        // A. Se já estiver logado e tentar acessar Home, Login ou Cadastro, manda pro Dashboard dele
        if (isPublicPage) {
            return NextResponse.redirect(new URL(`/${userRoleFromToken}/dashboard`, request.url));
        }

        // B. Validação de Rotas Protegidas (ex: /patient/dashboard)
        const segments = pathname.split('/');
        // Exemplo: pathname "/patient/dashboard" -> segments: ["", "patient", "dashboard"]
        const requestedRole = segments[1] as RoleEnum; 

        // Se a rota acessada não começar com uma role válida do Enum
        if (!Object.values(RoleEnum).includes(requestedRole)) {
             return NextResponse.redirect(new URL(`/${userRoleFromToken}/dashboard`, request.url));
        }

        // Se tentar acessar pasta de outra role (ex: Paciente tentando acessar /psychologist)
        if (requestedRole !== userRoleFromToken) {
            return NextResponse.redirect(new URL(`/${userRoleFromToken}/dashboard`, request.url));
        }

    } catch (error) {
        console.error("Erro no middleware:", error);
        // Se o token for inválido, limpa e manda pro login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('psiconet_token');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/about',
        '/admin/:path*', 
        '/psychologist/:path*', 
        '/patient/:path*'
    ],
};