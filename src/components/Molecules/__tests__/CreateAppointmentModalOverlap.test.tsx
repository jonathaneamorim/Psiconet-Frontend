import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateAppointmentModal } from '../CreateAppointmentModal';
import { getActiveConnectionsAction } from '@/actions/connections';
import { getMyPsychologistProfileAction } from '@/actions/profile';
import { getVideoConfigAction } from '@/actions/video';
import { checkAppointmentOverlapsAction } from '@/actions/appointments';
import { draftRecurrenceOverlapsAction } from '@/actions/recurrenceRules';
import type { OverlapSummary } from '@/types/appointment';

jest.mock('@/actions/connections', () => ({ getActiveConnectionsAction: jest.fn() }));
jest.mock('@/actions/profile', () => ({ getMyPsychologistProfileAction: jest.fn() }));
jest.mock('@/actions/video', () => ({ getVideoConfigAction: jest.fn() }));
jest.mock('@/actions/appointments', () => ({ checkAppointmentOverlapsAction: jest.fn() }));
jest.mock('@/actions/recurrenceRules', () => ({ draftRecurrenceOverlapsAction: jest.fn() }));

const patient = { user: { id: 'pat-1', fullName: 'Ana Paciente', treatmentLinkId: 'link-1', defaultPrice: 150 } };
const conflict: OverlapSummary = {
  id: 'apt-9',
  startDateTime: '2030-03-04T10:00:00',
  endDateTime: '2030-03-04T10:50:00',
  title: 'Sessão',
  patientName: 'Bruno Outro',
};

function renderModal(onConfirm: jest.Mock, onConfirmRecurrence = jest.fn().mockResolvedValue(true)) {
  (getActiveConnectionsAction as jest.Mock).mockResolvedValue({ data: { content: [patient] } });
  (getMyPsychologistProfileAction as jest.Mock).mockResolvedValue({ data: {} });
  (getVideoConfigAction as jest.Mock).mockResolvedValue({ enabled: true });
  const onClose = jest.fn();
  render(
    <CreateAppointmentModal
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      onConfirmRecurrence={onConfirmRecurrence}
      isMutating={false}
      initialDate={new Date(2030, 2, 4)}
    />
  );
  return { onClose, onConfirmRecurrence };
}

describe('CreateAppointmentModal — sobreposição de horário (ADR 019)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra aviso em tempo real quando o horário já tem consulta, sem bloquear o botão', async () => {
    (checkAppointmentOverlapsAction as jest.Mock).mockResolvedValue({ data: [conflict] });
    renderModal(jest.fn().mockResolvedValue(true));
    await screen.findByRole('option', { name: /Ana Paciente/ });

    const warning = await screen.findByRole('status', {}, { timeout: 2000 });
    expect(warning).toHaveTextContent('Você já tem consulta neste horário');
    expect(warning).toHaveTextContent(/Bruno Outro das 10:00 às 10:50/);
    expect(screen.getByRole('button', { name: 'Criar Agendamento' })).toBeEnabled();
    expect(checkAppointmentOverlapsAction).toHaveBeenCalledWith(expect.stringMatching(/^2030-03-04T/), expect.stringMatching(/^2030-03-04T/));
  });

  it('aguarda o usuário parar de digitar antes de consultar (debounce)', async () => {
    jest.useFakeTimers();
    try {
      (checkAppointmentOverlapsAction as jest.Mock).mockResolvedValue({ data: [] });
      renderModal(jest.fn().mockResolvedValue(true));
      await act(async () => { await Promise.resolve(); });
      await act(async () => { jest.advanceTimersByTime(100); });
      expect(checkAppointmentOverlapsAction).not.toHaveBeenCalled();
      await act(async () => { jest.advanceTimersByTime(500); });
      expect(checkAppointmentOverlapsAction).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('409 abre o diálogo de confirmação e reenvia com acknowledgeOverlap', async () => {
    (checkAppointmentOverlapsAction as jest.Mock).mockResolvedValue({ data: [] });
    const onConfirm = jest.fn()
      .mockResolvedValueOnce({ overlapConflicts: [conflict] })
      .mockResolvedValueOnce(true);
    const { onClose } = renderModal(onConfirm);
    await screen.findByRole('option', { name: /Ana Paciente/ });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));

    const dialog = await screen.findByRole('alertdialog', { name: 'Horário já ocupado' });
    expect(dialog).toHaveTextContent('Bruno Outro');
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveFocus();
    expect(onConfirm.mock.calls[0][0].acknowledgeOverlap).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: 'Agendar mesmo assim' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(2));
    expect(onConfirm.mock.calls[1][0]).toMatchObject({ acknowledgeOverlap: true, startDateTime: onConfirm.mock.calls[0][0].startDateTime });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('Voltar fecha o diálogo sem reenviar', async () => {
    (checkAppointmentOverlapsAction as jest.Mock).mockResolvedValue({ data: [] });
    const onConfirm = jest.fn().mockResolvedValue({ overlapConflicts: [conflict] });
    renderModal(onConfirm);
    await screen.findByRole('option', { name: /Ana Paciente/ });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await screen.findByRole('alertdialog');
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('série recorrente: avisa as datas sobrepostas e confirma a 1ª ocorrência', async () => {
    (checkAppointmentOverlapsAction as jest.Mock).mockResolvedValue({ data: [] });
    (draftRecurrenceOverlapsAction as jest.Mock).mockResolvedValue({
      data: [{ startDateTime: conflict.startDateTime, endDateTime: conflict.endDateTime, overlappingAppointments: [conflict] }],
    });
    const onConfirmRecurrence = jest.fn()
      .mockResolvedValueOnce({ overlapConflicts: [conflict] })
      .mockResolvedValueOnce(true);
    renderModal(jest.fn(), onConfirmRecurrence);
    await screen.findByRole('option', { name: /Ana Paciente/ });
    fireEvent.click(screen.getByRole('checkbox', { name: /Consulta recorrente/ }));

    const warning = await screen.findByRole('status', {}, { timeout: 2000 });
    expect(warning).toHaveTextContent('1 data da série coincide com outra consulta');
    expect(warning).toHaveTextContent(/Bruno Outro em 04\/03/);
    // O rascunho é verificado com o vínculo do paciente selecionado
    expect((draftRecurrenceOverlapsAction as jest.Mock).mock.calls.at(-1)[0]).toBe('link-1');

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Agendar mesmo assim' }));
    await waitFor(() => expect(onConfirmRecurrence).toHaveBeenCalledTimes(2));
    expect(onConfirmRecurrence.mock.calls[1][1]).toMatchObject({ acknowledgeOverlap: true });
  });
});
