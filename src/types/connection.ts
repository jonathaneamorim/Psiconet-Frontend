export type ConnectionStatusEnum = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REMOVED';

export interface UserSummaryDTO {
  id: string;
  fullName: string | null;
  photoUrl: string | null;
  role: string;
}

export interface ConnectionRequest {
  id: string;
  sender: UserSummaryDTO;
  receiver: UserSummaryDTO;
  status: ConnectionStatusEnum;
  requestedAt: string;
  acceptedAt: string | null;
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: PageMetadata;
}

export interface SpecialtyDTO {
  id: string;
  name: string;
}

export interface ConnectedUserDTO {
  id: string;
  fullName: string;
  photoUrl?: string;
  role: 'PATIENT' | 'PSYCHOLOGIST';
  city?: string;
  state?: string;
  crp?: string;
  specialties?: SpecialtyDTO[];
  experienceTime?: number;
  description?: string;
}

export interface ActiveConnectionDTO {
  connectionId: string;
  connectedAt: string;
  user: ConnectedUserDTO;
}
