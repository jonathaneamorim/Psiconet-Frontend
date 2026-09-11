export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    PATIENT_DASHBOARD: '/patient/dashboard',
    PSYCHOLOGIST_DASHBOARD: '/psychologist/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    PATIENT_SEARCH: '/patient/search',
    PSYCHOLOGIST_SEARCH: '/psychologist/search',
    PATIENT_PROFILE: '/patient/profile',
    PSYCHOLOGIST_PROFILE: '/psychologist/profile',
    PATIENT_CONNECTIONS: '/patient/connections',
    PSYCHOLOGIST_CONNECTIONS: '/psychologist/connections',
    PATIENT_APPOINTMENTS: '/patient/appointments',
    PSYCHOLOGIST_APPOINTMENTS: '/psychologist/appointments',
    PATIENT_PAYMENTS: '/patient/payments',
    PSYCHOLOGIST_PAYMENTS: '/psychologist/payments',
    PSYCHOLOGIST_SETTINGS: '/psychologist/settings',
    PATIENT_SETTINGS: '/patient/settings',
    NOTIFICATIONS: '/notifications',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.ABOUT] as const;
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
