import type { PageMetadata, PaginatedResponse } from '@/types/connection';

export type { PageMetadata, PaginatedResponse };

/** Espelha UserStatusEnum do backend */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_VERIFICATION';
export type UserRole = 'ADMIN' | 'PSYCHOLOGIST' | 'PATIENT';

/** GET /admin/users — CPF já chega mascarado do backend (•••.456.789-••) */
export interface AdminUser {
  id: string;
  fullName: string | null;
  email: string | null;
  maskedCpf: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  baseAdmin: boolean;
  lastLoginAt: string | null;
}

export interface AdminUserFilters {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
}

export interface UpdateUserStatusPayload {
  status: Extract<UserStatus, 'ACTIVE' | 'INACTIVE' | 'BLOCKED'>;
}

/** PUT /admin/users/{id} — sem role e sem status (papel nunca muda) */
export interface UpdateUserPayload {
  fullName: string;
  phone: string;
  email?: string;
}

export interface CreateAdminPayload {
  fullName: string;
  email: string;
  cpf: string;
  temporaryPassword: string;
}

export interface NotifyUserPayload {
  recipientId: string;
  title: string;
  message: string;
}

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activePsychologists: number;
  activePatients: number;
  totalPsychologists: number;
  totalPatients: number;
  totalAdmins: number;
  tickets: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    pending: number;
    finished: number;
  };
  generatedAt: string;
}
