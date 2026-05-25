import type { PageMetadata, PaginatedResponse } from '@/types/connection';

export type { PageMetadata, PaginatedResponse };

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type UserRole = 'ADMIN' | 'PSYCHOLOGIST' | 'PATIENT';

/** Formato real retornado pelo endpoint GET /admin/users */
export interface AdminUser {
  id: string;
  fullName: string | null;
  email: string | null;
  maskedCpf: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface UpdateUserPayload {
  fullName: string;
  phone: string;
  status: UserStatus;
}
