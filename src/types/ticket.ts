/** Espelha os enums de suporte do backend (model/enums/support) */
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ACCOUNT' | 'REGISTRATION' | 'APPOINTMENT' | 'PAYMENT' | 'TECHNICAL' | 'PRIVACY' | 'OTHER';

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Encerrado',
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  ACCOUNT: 'Acesso e conta',
  REGISTRATION: 'Cadastro',
  APPOINTMENT: 'Agendamentos',
  PAYMENT: 'Cobranças e pagamentos',
  TECHNICAL: 'Problema técnico',
  PRIVACY: 'Privacidade / LGPD (meus dados)',
  OTHER: 'Outro assunto',
};

/** Limites espelhados do backend (o backend é a autoridade) */
export const TICKET_LIMITS = { subjectMin: 5, subjectMax: 120, descriptionMin: 10, descriptionMax: 4000, messageMax: 4000 };

export interface TicketSummary {
  id: string;
  protocol: string;
  category: TicketCategory;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string | null;
  lastMessageAt: string | null;
  requesterName: string | null;
  requesterRole: 'PATIENT' | 'PSYCHOLOGIST' | null;
}

export interface TicketMessage {
  id: string;
  authorName: string;
  fromSupport: boolean;
  mine: boolean;
  content: string;
  createdAt: string;
}

export interface TicketDetail {
  id: string;
  protocol: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  requesterName: string;
  requesterEmail: string | null;
  requesterRole: 'PATIENT' | 'PSYCHOLOGIST' | null;
  canReply: boolean;
  messages: TicketMessage[];
}

export interface CreateTicketPayload {
  category: TicketCategory;
  subject: string;
  description: string;
}
