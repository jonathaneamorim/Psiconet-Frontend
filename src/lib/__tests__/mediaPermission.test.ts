import { detectBrowser, isPermissionError, kindsLabel, permissionSteps, requestMediaAccess } from '../mediaPermission';

const named = (name: string) => Object.assign(new Error('x'), { name });

describe('mediaPermission', () => {
  it('reconhece erro de permissão do navegador', () => {
    expect(isPermissionError(named('NotAllowedError'))).toBe(true);
    expect(isPermissionError(named('NotFoundError'))).toBe(false);
    expect(isPermissionError('NotAllowedError')).toBe(false);
  });

  it('identifica o navegador pelo user agent (Edge antes de Chrome)', () => {
    expect(detectBrowser('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/141.0 Safari/537.36 Edg/141.0')).toBe('edge');
    expect(detectBrowser('Mozilla/5.0 (X11; Linux) AppleWebKit/537.36 Chrome/141.0 Safari/537.36')).toBe('chrome');
    expect(detectBrowser('Mozilla/5.0 (X11; Linux; rv:140.0) Gecko/20100101 Firefox/140.0')).toBe('firefox');
    expect(detectBrowser('Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15')).toBe('safari');
    expect(detectBrowser('curl/8')).toBe('other');
  });

  it('monta os passos de desbloqueio pelo navegador e dispositivo', () => {
    expect(permissionSteps('chrome', ['camera'])[1]).toBe('Em Câmera, escolha "Permitir".');
    expect(permissionSteps('safari', ['camera', 'microphone'])[1]).toBe('Em Câmera e Microfone, escolha "Permitir".');
    expect(kindsLabel(['microphone'])).toBe('ao microfone');
  });

  it('pede só os dispositivos solicitados e libera a mídia logo depois', async () => {
    const stop = jest.fn();
    const getUserMedia = jest.fn().mockResolvedValue({ getTracks: () => [{ stop }] });
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });

    await expect(requestMediaAccess(['camera'])).resolves.toBeNull();
    expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: false });
    expect(stop).toHaveBeenCalled();

    getUserMedia.mockRejectedValueOnce(named('NotAllowedError'));
    const error = await requestMediaAccess(['microphone']);
    expect(error?.name).toBe('NotAllowedError');
  });
});
