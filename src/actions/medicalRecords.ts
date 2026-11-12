'use server';

import { apiClient } from '@/services/api/apiClient';
import type { ActionResult } from '@/types/auth';
import type { PaginatedResponse } from '@/types/connection';
import type {
  AccessRequest,
  ClinicalAuditEntry,
  MedicalRecord,
  MedicalRecordFields,
  MedicalRecordSummary,
  PatientRecordLink,
  PatientRecordView,
  RichTextDoc,
  SessionNote,
  SessionNoteType,
} from '@/types/medicalRecord';

type Result<T> = { data?: T; error?: string; status?: number; code?: string };
const id = (value: string) => encodeURIComponent(value);

// ── Psicólogo ────────────────────────────────────────────────────────────────

export async function getMyMedicalRecordsAction(): Promise<Result<MedicalRecordSummary[]>> {
  return apiClient.get<MedicalRecordSummary[]>('/medical-records');
}

export async function getMedicalRecordAction(linkId: string): Promise<Result<MedicalRecord>> {
  return apiClient.get<MedicalRecord>(`/medical-records/links/${id(linkId)}`);
}

export async function updateMedicalRecordAction(
  linkId: string,
  fields: MedicalRecordFields,
  version: number | null
): Promise<ActionResult & { data?: MedicalRecord }> {
  const result = await apiClient.put<MedicalRecord>(`/medical-records/links/${id(linkId)}`, { ...fields, version });
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function getSessionNotesAction(linkId: string): Promise<Result<SessionNote[]>> {
  return apiClient.get<SessionNote[]>(`/medical-records/links/${id(linkId)}/notes`);
}

export async function createSessionNoteAction(
  linkId: string,
  payload: { appointmentId: string | null; type: SessionNoteType; title: string; content: RichTextDoc }
): Promise<ActionResult & { data?: SessionNote }> {
  const result = await apiClient.post<SessionNote>(`/medical-records/links/${id(linkId)}/notes`, payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function saveSessionNoteDraftAction(
  noteId: string,
  payload: { type: SessionNoteType; title: string; content: RichTextDoc; version: number | null }
): Promise<ActionResult & { data?: SessionNote }> {
  const result = await apiClient.put<SessionNote>(`/medical-records/notes/${id(noteId)}/draft`, payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors, code: result.status === 409 ? 'CONFLICT' : result.code };
  return { success: true, data: result.data };
}

export async function finalizeSessionNoteAction(noteId: string): Promise<ActionResult & { data?: SessionNote }> {
  const result = await apiClient.post<SessionNote>(`/medical-records/notes/${id(noteId)}/finalize`);
  if (result.error) return { error: result.error };
  return { success: true, data: result.data };
}

export async function addSessionNoteAddendumAction(
  noteId: string,
  payload: { reason: string; content: RichTextDoc }
): Promise<ActionResult & { data?: SessionNote }> {
  const result = await apiClient.post<SessionNote>(`/medical-records/notes/${id(noteId)}/addenda`, payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function getPsychologistAccessRequestsAction(): Promise<Result<AccessRequest[]>> {
  return apiClient.get<AccessRequest[]>('/medical-records/access-requests');
}

export async function grantAccessRequestAction(
  requestId: string,
  payload: { expiresAt: string | null; exportAllowed: boolean }
): Promise<ActionResult & { data?: AccessRequest }> {
  const result = await apiClient.post<AccessRequest>(`/medical-records/access-requests/${id(requestId)}/grant`, payload);
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function denyAccessRequestAction(
  requestId: string,
  justification: string
): Promise<ActionResult & { data?: AccessRequest }> {
  const result = await apiClient.post<AccessRequest>(`/medical-records/access-requests/${id(requestId)}/deny`, { justification });
  if (result.error) return { error: result.error, fields: result.fieldErrors };
  return { success: true, data: result.data };
}

export async function getClinicalAuditAction(linkId: string, page = 0): Promise<Result<PaginatedResponse<ClinicalAuditEntry>>> {
  return apiClient.get<PaginatedResponse<ClinicalAuditEntry>>(`/medical-records/links/${id(linkId)}/audit?page=${page}&size=20`);
}

// ── Paciente ─────────────────────────────────────────────────────────────────

export async function getMyRecordLinksAction(): Promise<Result<PatientRecordLink[]>> {
  return apiClient.get<PatientRecordLink[]>('/patient/medical-records');
}

export async function requestRecordAccessAction(linkId: string): Promise<ActionResult & { data?: AccessRequest }> {
  const result = await apiClient.post<AccessRequest>(`/patient/medical-records/links/${id(linkId)}/access-requests`);
  if (result.error) return { error: result.error, code: result.code };
  return { success: true, data: result.data };
}

export async function getGrantedRecordAction(requestId: string): Promise<Result<PatientRecordView>> {
  return apiClient.get<PatientRecordView>(`/patient/medical-records/access-requests/${id(requestId)}/record`);
}
