export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    PATIENT_DASHBOARD: '/patient/dashboard',
    PSYCHOLOGIST_DASHBOARD: '/psychologist/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.ABOUT] as const;
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
