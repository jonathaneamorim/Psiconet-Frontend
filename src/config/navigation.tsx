import type { JSX } from 'react';
import { RoleEnum } from '@/enums/RoleEnum';
import { ROUTES } from '@/config/routes';

export interface NavItem {
  label: string;
  href: string;
  icon: JSX.Element;
  comingSoon?: boolean;
}

// ─── Ícones reutilizáveis ────────────────────────────────────────────────────

const IconDashboard = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconUsers = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPatients = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconAppointments = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSettings = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconSearch = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const IconConnections = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// ─── Configuração central de navegação ──────────────────────────────────────

export const NAV_ITEMS: Record<RoleEnum, NavItem[]> = {
  [RoleEnum.ADMIN]: [
    {
      label: 'Dashboard',
      href: ROUTES.ADMIN_DASHBOARD,
      icon: IconDashboard,
    },
    {
      label: 'Usuários',
      href: ROUTES.ADMIN_USERS,
      icon: IconUsers,
    },
  ],

  [RoleEnum.PSYCHOLOGIST]: [
    {
      label: 'Dashboard',
      href: ROUTES.PSYCHOLOGIST_DASHBOARD,
      icon: IconDashboard,
    },
    {
      label: 'Pacientes',
      href: '#',
      icon: IconPatients,
      comingSoon: true,
    },
    {
      label: 'Buscar Pacientes',
      href: ROUTES.PSYCHOLOGIST_SEARCH,
      icon: IconSearch,
    },
    {
      label: 'Conexões',
      href: ROUTES.PSYCHOLOGIST_CONNECTIONS,
      icon: IconConnections,
    },
    {
      label: 'Configurações',
      href: '#',
      icon: IconSettings,
      comingSoon: true,
    },
  ],

  [RoleEnum.PATIENT]: [
    {
      label: 'Dashboard',
      href: ROUTES.PATIENT_DASHBOARD,
      icon: IconDashboard,
    },
    {
      label: 'Consultas',
      href: '#',
      icon: IconAppointments,
      comingSoon: true,
    },
    {
      label: 'Buscar Psicólogos',
      href: ROUTES.PATIENT_SEARCH,
      icon: IconSearch,
    },
    {
      label: 'Conexões',
      href: ROUTES.PATIENT_CONNECTIONS,
      icon: IconConnections,
    },
    {
      label: 'Configurações',
      href: '#',
      icon: IconSettings,
      comingSoon: true,
    },
  ],
};
