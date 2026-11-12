export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    PATIENT_DASHBOARD: '/patient/dashboard',
    PSYCHOLOGIST_DASHBOARD: '/psychologist/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_TICKETS: '/admin/tickets',
    SUPPORT: '/support',
    SUPPORT_NEW: '/support/new',
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
    PSYCHOLOGIST_MEDICAL_RECORDS: '/psychologist/medical-records',
    PATIENT_MEDICAL_RECORDS: '/patient/medical-records',
    CHANGE_PASSWORD: '/change-password',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    COOKIES: '/cookies',
    ACCEPT_TERMS: '/accept-terms',
    /** Sala de vídeo integrada: /call/[appointmentId] (psicólogo e paciente; autorização no backend). */
    CALL: '/call',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.ABOUT] as const;
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

/** Documentos legais: abertos a TODOS, logados ou não (não redirecionam para o dashboard). */
export const LEGAL_ROUTES = [ROUTES.TERMS, ROUTES.PRIVACY, ROUTES.COOKIES] as const;
