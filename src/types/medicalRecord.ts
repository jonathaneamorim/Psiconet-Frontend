/** Documento do editor (JSON ProseMirror/TipTap) — validado por whitelist no backend. */
export interface RichTextMark {
  type: 'bold' | 'italic' | 'underline' | 'textStyle';
  /** Só em textStyle: tamanho da lista FONT_SIZES */
  attrs?: { fontSize?: string | null };
}

export type TextAlign = 'left' | 'center' | 'right';

/** Espelha RichTextSanitizer.FONT_SIZES do backend (16px = padrão, sem marca). */
export const FONT_SIZES = ['12px', '14px', '18px', '20px', '24px'] as const;
export const FONT_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '12px', label: 'Muito pequeno' },
  { value: '14px', label: 'Pequeno' },
  { value: '', label: 'Normal' },
  { value: '18px', label: 'Médio' },
  { value: '20px', label: 'Grande' },
  { value: '24px', label: 'Muito grande' },
];

export interface RichTextNode {
  type: 'doc' | 'paragraph' | 'heading' | 'text' | 'bulletList' | 'orderedList' | 'listItem' | 'hardBreak';
  attrs?: { level?: 1 | 2; start?: number; textAlign?: TextAlign | null };
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
}

export type RichTextDoc = RichTextNode & { type: 'doc' };

export const EMPTY_DOC: RichTextDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

export type SessionNoteType = 'RECORD' | 'PRIVATE';
export type SessionNoteStatus = 'DRAFT' | 'FINALIZED';
export type RecordAccessStatus = 'PENDING' | 'GRANTED' | 'DENIED';

export const NOTE_TYPE_LABEL: Record<SessionNoteType, string> = {
  RECORD: 'Registro documental',
  PRIVATE: 'Anotação pessoal',
};

export const NOTE_TYPE_HINT: Record<SessionNoteType, string> = {
  RECORD: 'Integra o prontuário e pode ser liberado ao paciente mediante solicitação.',
  PRIVATE: 'Anotação de trabalho do psicólogo. Nunca é entregue automaticamente ao paciente.',
};

export interface MedicalRecordSummary {
  treatmentLinkId: string;
  recordId: string | null;
  patientUserId: string;
  patientName: string;
  linkActive: boolean;
  recordOpened: boolean;
  notesCount: number;
  pendingAccessRequests: number;
  updatedAt: string | null;
}

export interface MedicalRecordFields {
  demand: string | null;
  goals: string | null;
  history: string | null;
  procedures: string | null;
  closing: string | null;
}

export interface MedicalRecord extends MedicalRecordFields {
  recordId: string | null;
  treatmentLinkId: string;
  patientUserId: string;
  patientName: string;
  linkActive: boolean;
  opened: boolean;
  canEdit: boolean;
  openingDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  version: number | null;
}

export interface SessionNoteAddendum {
  id: string;
  sequence: number;
  reason: string;
  content: RichTextDoc;
  authorName: string;
  authorCrp: string | null;
  integrityHash: string;
  integrityVerified: boolean;
  createdAt: string;
}

export interface SessionNote {
  id: string;
  appointmentId: string | null;
  appointmentStart: string | null;
  type: SessionNoteType;
  status: SessionNoteStatus;
  title: string | null;
  content: RichTextDoc | null;
  authorName: string | null;
  authorCrp: string | null;
  integrityHash: string | null;
  integrityVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
  finalizedAt: string | null;
  editable: boolean;
  version: number | null;
  addenda: SessionNoteAddendum[];
}

export interface AccessRequest {
  id: string;
  treatmentLinkId: string;
  patientName: string;
  psychologistName: string;
  status: RecordAccessStatus;
  activeGrant: boolean;
  requestedAt: string;
  decidedAt: string | null;
  expiresAt: string | null;
  exportAllowed: boolean;
  justification: string | null;
}

export interface PatientRecordLink {
  treatmentLinkId: string;
  psychologistName: string;
  psychologistCrp: string | null;
  linkActive: boolean;
  latestRequest: AccessRequest | null;
}

export interface PatientRecordView extends MedicalRecordFields {
  accessRequestId: string;
  patientName: string;
  psychologistName: string;
  psychologistCrp: string | null;
  openingDate: string | null;
  notes: SessionNote[];
  accessExpiresAt: string | null;
  exportAllowed: boolean;
}

export interface ClinicalAuditEntry {
  sequence: number;
  action: string;
  actorRole: 'ADMIN' | 'PSYCHOLOGIST' | 'PATIENT' | null;
  actorName: string;
  occurredAt: string;
}

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  RECORD_VIEWED: 'Prontuário visualizado',
  RECORD_CREATED: 'Prontuário aberto',
  RECORD_UPDATED: 'Prontuário atualizado',
  NOTE_CREATED: 'Anotação criada',
  NOTE_DRAFT_SAVED: 'Rascunho salvo',
  NOTE_VIEWED: 'Anotações visualizadas',
  NOTE_FINALIZED: 'Anotação finalizada',
  NOTE_ADDENDUM_ADDED: 'Adendo registrado',
  AUDIT_VIEWED: 'Auditoria consultada',
  ACCESS_REQUESTED: 'Paciente solicitou acesso',
  ACCESS_GRANTED: 'Acesso liberado ao paciente',
  ACCESS_DENIED: 'Acesso negado ao paciente',
  PATIENT_RECORD_VIEWED: 'Paciente visualizou o prontuário',
  PDF_EXPORTED: 'PDF exportado',
  ACCESS_DENIED_ATTEMPT: 'Tentativa de acesso negada',
  LEGACY_DATA_MIGRATED: 'Dados migrados para o formato seguro',
  KEY_REWRAPPED: 'Chave de criptografia rotacionada',
};
