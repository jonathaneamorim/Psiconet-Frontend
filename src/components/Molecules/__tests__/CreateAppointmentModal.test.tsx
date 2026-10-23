import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateAppointmentModal } from '../CreateAppointmentModal';
import { getActiveConnectionsAction } from '@/actions/connections';
import { getMyPsychologistProfileAction } from '@/actions/profile';
import { getVideoConfigAction } from '@/actions/video';

jest.mock('@/actions/connections', () => ({ getActiveConnectionsAction: jest.fn() }));
jest.mock('@/actions/profile', () => ({ getMyPsychologistProfileAction: jest.fn() }));
jest.mock('@/actions/video', () => ({ getVideoConfigAction: jest.fn() }));

const patient = { user: { id: 'pat-1', fullName: 'Ana Paciente', treatmentLinkId: 'link-1', defaultPrice: 150 } };

function setup(videoEnabled: boolean) {
  (getActiveConnectionsAction as jest.Mock).mockResolvedValue({ data: { content: [patient] } });
  (getMyPsychologistProfileAction as jest.Mock).mockResolvedValue({ data: {} });
  (getVideoConfigAction as jest.Mock).mockResolvedValue({ enabled: videoEnabled });
  const onConfirm = jest.fn().mockResolvedValue(true);
  const onConfirmRecurrence = jest.fn().mockResolvedValue(true);
  render(
    <CreateAppointmentModal
      isOpen
      onClose={jest.fn()}
      onConfirm={onConfirm}
      onConfirmRecurrence={onConfirmRecurrence}
      isMutating={false}
      initialDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
    />
  );
  return { onConfirm, onConfirmRecurrence };
}

async function ready() {
  await screen.findByRole('option', { name: /Ana Paciente/ });
}

describe('CreateAppointmentModal — provedor da videochamada', () => {
  it('Sala Psiconet é o padrão quando disponível e não envia link', async () => {
    const { onConfirm } = setup(true);
    await ready();
    expect(await screen.findByRole('radio', { name: /Sala Psiconet/ })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls[0][0]).toMatchObject({ meetingType: 'VIDEO_CALL', meetingProvider: 'IN_APP' });
    expect(onConfirm.mock.calls[0][0].meetingLink).toBeUndefined();
  });

  it('link externo valida o link só nesse modo', async () => {
    const { onConfirm } = setup(true);
    await ready();
    fireEvent.click(await screen.findByRole('radio', { name: /Link externo/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Informe o link/);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Link da Videochamada/), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/https:\/\//);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Link da Videochamada/), { target: { value: 'https://meet.google.com/abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls[0][0]).toMatchObject({ meetingProvider: 'EXTERNAL_LINK', meetingLink: 'https://meet.google.com/abc' });
  });

  it('modo recorrente também envia o provedor', async () => {
    const { onConfirmRecurrence } = setup(true);
    await ready();
    fireEvent.click(screen.getByRole('checkbox', { name: /Consulta recorrente/ }));
    await screen.findByRole('radio', { name: /Sala Psiconet/ });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await waitFor(() => expect(onConfirmRecurrence).toHaveBeenCalled());
    const [linkId, dto] = onConfirmRecurrence.mock.calls[0];
    expect(linkId).toBe('link-1');
    expect(dto).toMatchObject({ meetingType: 'VIDEO_CALL', meetingProvider: 'IN_APP' });
    expect(dto.meetingLink).toBeUndefined();
  });

  it('com a funcionalidade desligada usa link externo obrigatório', async () => {
    const { onConfirm } = setup(false);
    await ready();
    await waitFor(() => expect(getVideoConfigAction).toHaveBeenCalled());
    expect(screen.queryByRole('radio', { name: /Sala Psiconet/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Link da Videochamada/), { target: { value: 'zoom.us/j/1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Agendamento' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls[0][0]).toMatchObject({ meetingProvider: 'EXTERNAL_LINK', meetingLink: 'zoom.us/j/1' });
  });
});
