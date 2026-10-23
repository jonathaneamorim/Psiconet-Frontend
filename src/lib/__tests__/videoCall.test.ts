import { formatCountdown, getJoinState, isInAppVideo, mediaErrorMessage, videoJoinErrorMessage } from '../videoCall';
import { resolveNotificationRoute } from '../notificationRoutes';
import { RoleEnum } from '@/enums/RoleEnum';
import type { AppointmentDTO } from '@/types/appointment';

type Window = Pick<AppointmentDTO, 'meetingType' | 'meetingProvider' | 'status' | 'joinOpensAt' | 'joinClosesAt'>;

const inApp = (overrides: Partial<Window> = {}): Window => ({
  meetingType: 'VIDEO_CALL',
  meetingProvider: 'IN_APP',
  status: 'ACCEPTED',
  joinOpensAt: '2026-10-23T13:50:00',
  joinClosesAt: '2026-10-23T15:05:00',
  ...overrides,
});

describe('getJoinState', () => {
  it('antes da janela informa quando abre', () => {
    const state = getJoinState(inApp(), new Date('2026-10-23T13:45:00'));
    expect(state.kind).toBe('upcoming');
    if (state.kind === 'upcoming') expect(state.msUntilOpen).toBe(5 * 60 * 1000);
  });

  it('dentro da janela (inclusive após o job concluir a consulta) libera a entrada', () => {
    expect(getJoinState(inApp(), new Date('2026-10-23T13:50:00')).kind).toBe('open');
    expect(getJoinState(inApp({ status: 'COMPLETED' }), new Date('2026-10-23T15:00:00')).kind).toBe('open');
  });

  it('depois da janela fica encerrada', () => {
    expect(getJoinState(inApp(), new Date('2026-10-23T15:06:00')).kind).toBe('closed');
  });

  it('consulta cancelada, sem janela ou com link externo não usa a sala', () => {
    expect(getJoinState(inApp({ status: 'CANCELLED' }), new Date('2026-10-23T14:00:00')).kind).toBe('unavailable');
    expect(getJoinState(inApp({ status: 'NO_SHOW' }), new Date('2026-10-23T14:00:00')).kind).toBe('unavailable');
    expect(getJoinState(inApp({ joinOpensAt: undefined }), new Date()).kind).toBe('unavailable');
    expect(getJoinState(inApp({ meetingProvider: 'EXTERNAL_LINK' })).kind).toBe('not-in-app');
    expect(getJoinState(inApp({ meetingType: 'IN_PERSON' })).kind).toBe('not-in-app');
    expect(isInAppVideo({ meetingType: 'VIDEO_CALL', meetingProvider: undefined })).toBe(false);
  });
});

describe('formatCountdown', () => {
  it('formata segundos, minutos e horas', () => {
    expect(formatCountdown(42_000)).toBe('42 s');
    expect(formatCountdown(4 * 60_000 + 5_000)).toBe('4 min 05 s');
    expect(formatCountdown(80 * 60_000)).toBe('1 h 20 min');
    expect(formatCountdown(-1)).toBe('0 s');
  });
});

describe('videoJoinErrorMessage', () => {
  it('usa a mensagem do backend para janela/situação e textos próprios para os demais', () => {
    expect(videoJoinErrorMessage({ code: 'VIDEO_WINDOW_NOT_OPEN', error: 'A sala abre em 23/10 às 13:50.' }))
      .toBe('A sala abre em 23/10 às 13:50.');
    expect(videoJoinErrorMessage({ status: 404, error: 'Appointment não encontrado: x' }))
      .toBe('Consulta não encontrada ou você não participa dela.');
    expect(videoJoinErrorMessage({ status: 429, code: 'RATE_LIMITED', retryAfter: 300 })).toMatch(/5 min/);
    expect(videoJoinErrorMessage({ status: 503, code: 'VIDEO_UNAVAILABLE' })).toMatch(/indisponível/);
  });
});

describe('mediaErrorMessage', () => {
  const err = (name: string) => Object.assign(new Error('x'), { name });
  it('explica bloqueio de permissão, ausência e dispositivo em uso', () => {
    expect(mediaErrorMessage(err('NotAllowedError'))).toMatch(/cadeado/);
    expect(mediaErrorMessage(err('NotFoundError'))).toMatch(/Não encontramos/);
    expect(mediaErrorMessage(err('NotReadableError'))).toMatch(/em uso/);
    expect(mediaErrorMessage('?')).toMatch(/permissões/);
  });
});

describe('notificações de vídeo', () => {
  it('levam direto para a sala da consulta', () => {
    const n = { referenceType: 'APPOINTMENT', referenceId: 'abc', type: 'VIDEO_SESSION_REMINDER' as const };
    expect(resolveNotificationRoute(n, RoleEnum.PATIENT)).toBe('/call/abc');
    expect(resolveNotificationRoute({ ...n, type: 'VIDEO_PARTICIPANT_JOINED' }, RoleEnum.PATIENT)).toBe('/call/abc');
    expect(resolveNotificationRoute({ ...n, type: 'APPOINTMENT_SCHEDULED' }, RoleEnum.PATIENT)).toBe('/patient/appointments');
  });
});
