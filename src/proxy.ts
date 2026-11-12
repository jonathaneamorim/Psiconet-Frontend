import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RoleEnum } from "@/enums/RoleEnum";
import { ROUTES, PUBLIC_ROUTES, LEGAL_ROUTES } from "@/config/routes";
import { COOKIE_REFRESH, COOKIE_TOKEN } from "@/constants/cookies";
import { decodeRoleFromToken, isTokenExpired } from "@/lib/jwt";
import {
    buildSessionCookies,
    SESSION_COOKIE_NAMES,
    SESSION_EXPIRED_LOGIN_PATH,
    SESSION_EXPIRED_PARAM,
    SESSION_EXPIRED_VALUE,
    type SessionCookie,
} from "@/lib/sessionCookies";
import { refreshSession } from "@/lib/sessionRefresh";

// Renova um pouco antes de vencer, para a requisição não chegar ao backend com token expirado.
const REFRESH_MARGIN_MS = 60_000;

/*
 * Roteamento por papel + renovação transparente da sessão (ADR 014 do backend).
 * Decodificar o token aqui é só para NAVEGAÇÃO; quem valida assinatura, sessão, status e permissão
 * é sempre o backend.
 */
export async function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const isPublicPage = (PUBLIC_ROUTES as readonly string[]).includes(pathname);
    const isLegalPage = (LEGAL_ROUTES as readonly string[]).includes(pathname);

    // Sessão recusada pelo backend (apiClient redirecionou para cá): limpa os cookies e mostra o login.
    if (pathname === ROUTES.LOGIN && searchParams.get(SESSION_EXPIRED_PARAM) === SESSION_EXPIRED_VALUE) {
        return clearSession(NextResponse.next());
    }

    const accessCookie = request.cookies.get(COOKIE_TOKEN)?.value ?? null;
    const refreshCookie = request.cookies.get(COOKIE_REFRESH)?.value ?? null;

    let token = accessCookie && !isTokenExpired(accessCookie, Date.now(), REFRESH_MARGIN_MS) ? accessCookie : null;
    let renewed: SessionCookie[] = [];
    let sessionLost = false;

    if (!token && refreshCookie) {
        const session = await refreshSession(refreshCookie, {
            ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
        });
        if (session) {
            token = session.token;
            renewed = buildSessionCookies(session);
        } else if (session === null) {
            sessionLost = true;
        } else if (accessCookie && !isTokenExpired(accessCookie)) {
            // Backend indisponível: segue com o token atual enquanto ele ainda vale.
            token = accessCookie;
        }
    } else if (!token && accessCookie) {
        sessionLost = true; // token vencido e sem refresh
    }

    // Aplica os cookies renovados na resposta e repassa o novo token à própria requisição
    // (Server Components/Actions desta navegação já leem o cookie novo).
    const next = () => {
        if (renewed.length === 0) return NextResponse.next();
        const headers = new Headers(request.headers);
        const jar = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
        for (const c of renewed) jar.set(c.name, c.value);
        headers.set('cookie', [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; '));
        return withRenewed(NextResponse.next({ request: { headers } }));
    };
    const redirect = (path: string) => withRenewed(NextResponse.redirect(new URL(path, request.url)));
    const withRenewed = (response: NextResponse) => {
        for (const c of renewed) response.cookies.set(c.name, c.value, c.options);
        return response;
    };

    const userRole = token ? decodeRoleFromToken(token) : null;

    if (!userRole) {
        // Documentos legais e páginas públicas abrem sem login; o resto vai para o login.
        if (isPublicPage || isLegalPage) {
            return sessionLost || accessCookie ? clearSession(NextResponse.next()) : NextResponse.next();
        }
        if (pathname.startsWith('/api/')) {
            return clearSession(NextResponse.json({ message: 'Sua sessão expirou. Entre novamente.' }, { status: 401 }));
        }
        return clearSession(NextResponse.redirect(new URL(sessionLost ? SESSION_EXPIRED_LOGIN_PATH : ROUTES.LOGIN, request.url)));
    }

    const userDashboard = `/${userRole}/dashboard`;

    if (isLegalPage) return next();
    if (isPublicPage) return redirect(userDashboard);

    // Sala de vídeo: psicólogo e paciente (a participação na consulta é validada pelo backend)
    if (pathname.startsWith(`${ROUTES.CALL}/`)) {
        return userRole === RoleEnum.ADMIN ? redirect(userDashboard) : next();
    }

    // Rotas acessíveis por qualquer role autenticado
    const isSharedAuthRoute = pathname.startsWith('/notifications')
        || pathname === ROUTES.CHANGE_PASSWORD
        || pathname === ROUTES.ACCEPT_TERMS
        || pathname.startsWith('/api/');
    if (isSharedAuthRoute) {
        return next();
    }

    // Suporte: só pacientes e psicólogos (admin atende pelos chamados em /admin/tickets)
    if (pathname === ROUTES.SUPPORT || pathname.startsWith(`${ROUTES.SUPPORT}/`)) {
        return userRole === RoleEnum.ADMIN ? redirect(ROUTES.ADMIN_TICKETS) : next();
    }

    const requestedRole = pathname.split('/')[1] as RoleEnum;

    if (!Object.values(RoleEnum).includes(requestedRole)) {
        return redirect(userDashboard);
    }

    // Permitir acesso cruzado a perfis públicos (ex: um psicólogo vendo o perfil de um paciente)
    const isPublicProfileRoute = pathname.match(/^\/(patient|psychologist)\/profile\/[a-zA-Z0-9-]+$/);

    if (requestedRole !== userRole && !isPublicProfileRoute) {
        return redirect(userDashboard);
    }

    return next();
}

function clearSession(response: NextResponse) {
    for (const name of SESSION_COOKIE_NAMES) response.cookies.delete(name);
    return response;
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/about',
        '/terms',
        '/privacy',
        '/cookies',
        '/accept-terms',
        '/notifications/:path*',
        '/change-password',
        '/support',
        '/support/:path*',
        '/call/:path*',
        '/admin/:path*',
        '/psychologist/:path*',
        '/patient/:path*',
        '/api/:path*',
    ],
};
