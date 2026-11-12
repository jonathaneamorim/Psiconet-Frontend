import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MediaPermissionHelp } from '../MediaPermissionHelp';

const named = (name: string) => Object.assign(new Error('x'), { name });

function setup(permissions: { camera: PermissionState | 'unknown'; microphone: PermissionState | 'unknown' }) {
  const markResult = jest.fn();
  const onGranted = jest.fn();
  const view = render(
    <MediaPermissionHelp kinds={['camera']} permissions={permissions} markResult={markResult} onGranted={onGranted} onDismiss={jest.fn()} />,
  );
  return { markResult, onGranted, ...view };
}

describe('MediaPermissionHelp', () => {
  it('ainda não decidido: oferece abrir o pedido do navegador e marca como permitido', async () => {
    const getUserMedia = jest.fn().mockResolvedValue({ getTracks: () => [] });
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
    const { markResult } = setup({ camera: 'prompt', microphone: 'granted' });

    expect(screen.getByText('Permita o acesso à câmera')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Permitir acesso' }));

    await waitFor(() => expect(markResult).toHaveBeenCalledWith(['camera'], 'granted'));
    expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: false });
  });

  it('bloqueado: mostra os passos do navegador e avisa quando continua bloqueado', async () => {
    const getUserMedia = jest.fn().mockRejectedValue(named('NotAllowedError'));
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
    const { markResult } = setup({ camera: 'denied', microphone: 'granted' });

    expect(screen.getByText(/está bloqueado no navegador/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Recarregar a página' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Já permiti, tentar de novo' }));

    expect(await screen.findByText(/não liberou o acesso/)).toBeInTheDocument();
    expect(markResult).toHaveBeenCalledWith(['camera'], 'denied');
  });

  it('liberado nas configurações do navegador: avisa quem usa o componente', () => {
    const { onGranted, rerender, markResult } = setup({ camera: 'denied', microphone: 'granted' });
    expect(onGranted).not.toHaveBeenCalled();
    rerender(
      <MediaPermissionHelp kinds={['camera']} permissions={{ camera: 'granted', microphone: 'granted' }} markResult={markResult} onGranted={onGranted} />,
    );
    expect(onGranted).toHaveBeenCalledWith(['camera']);
  });
});
