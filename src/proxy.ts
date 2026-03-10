import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname.endsWith('/login');
    const role = pathname.split('/')[1];

    if(!['admin', 'paciente', 'psicologo'].includes(role))
        return NextResponse.redirect(new URL('/', request.url));

    if (!token) {
        if (isLoginPage) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL(`/${role}/login`, request.url));
    }

    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        const userRole = payload.role.toLowerCase().replace('role_', '');

        if(role !== userRole) 
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));

        if(isLoginPage && role === userRole) 
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));

    } catch (error) {
        // Se o usuarios estiver com um token porém ele é inválido, redireciona para a página de login
        if(isLoginPage) return NextResponse.next();
        
        return NextResponse.redirect(new URL(`/${role}/login`, request.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        '/admin/:path*', 
        '/paciente/:path*', 
        '/psicologo/:path*'
    ],
};