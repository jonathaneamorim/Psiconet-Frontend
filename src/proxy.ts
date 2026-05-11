import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RoleEnum } from "@/enums/RoleEnum";
import { ROUTES, PUBLIC_ROUTES } from "@/config/routes";
import { COOKIE_TOKEN } from "@/constants/cookies";
import { decodeRoleFromToken } from "@/lib/jwt";

export function proxy(request: NextRequest) {
    const token = request.cookies.get(COOKIE_TOKEN)?.value;
    const { pathname } = request.nextUrl;

    const isPublicPage = (PUBLIC_ROUTES as readonly string[]).includes(pathname);

    if (!token) {
        return isPublicPage
            ? NextResponse.next()
            : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    const userRole = decodeRoleFromToken(token);

    if (!userRole) {
        const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
        response.cookies.delete(COOKIE_TOKEN);
        return response;
    }

    const userDashboard = `/${userRole}/dashboard`;
    if (isPublicPage) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    const requestedRole = pathname.split('/')[1] as RoleEnum;

    if (!Object.values(RoleEnum).includes(requestedRole)) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
    }

    if (requestedRole !== userRole) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
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
        '/patient/:path*',
    ],
};