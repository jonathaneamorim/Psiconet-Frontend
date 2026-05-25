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

/** Metadados de paginação — campo `page` na resposta do Spring Boot */
export interface PageMetadata {
  size: number;
  number: number;       // página atual (0-indexed)
  totalElements: number;
  totalPages: number;
}

/** Resposta paginada do Spring Boot 3 */
export interface PaginatedResponse<T> {
  content: T[];
  page: PageMetadata;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface UpdateUserPayload {
  fullName: string;
  phone: string;
  status: UserStatus;
}
