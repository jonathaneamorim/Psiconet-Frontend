/*
 * Permissão de câmera e microfone. Nenhum navegador deixa o site abrir as configurações de permissão:
 * - estado "prompt" (ainda não decidido): pedir a mídia faz o próprio navegador mostrar o pedido;
 * - estado "denied" (bloqueado): só o usuário desbloqueia, pelos passos de cada navegador. A mudança é
 *   detectada pela Permissions API (onde existe) e a câmera/microfone volta sem recarregar a página.
 */

export type MediaKind = 'camera' | 'microphone';
export type MediaPermissionState = PermissionState | 'unknown';
export type BrowserFamily = 'chrome' | 'edge' | 'firefox' | 'safari' | 'other';

const PERMISSION_ERRORS = new Set(['NotAllowedError', 'PermissionDeniedError', 'SecurityError']);

export function isPermissionError(error: unknown): boolean {
  return error instanceof Error && PERMISSION_ERRORS.has(error.name);
}

export async function queryMediaPermission(kind: MediaKind): Promise<PermissionStatus | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return null;
    return await navigator.permissions.query({ name: kind as PermissionName });
  } catch {
    // Navegador sem suporte a "camera"/"microphone" na Permissions API.
    return null;
  }
}

/**
 * Pede a mídia só para disparar o pedido nativo do navegador e libera os dispositivos em seguida.
 * Devolve `null` em caso de sucesso ou o erro do navegador.
 */
export async function requestMediaAccess(kinds: MediaKind[]): Promise<Error | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return new Error('Este navegador não permite acessar câmera e microfone.');
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: kinds.includes('camera'),
      audio: kinds.includes('microphone'),
    });
    stream.getTracks().forEach((track) => track.stop());
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function detectBrowser(userAgent: string): BrowserFamily {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('firefox/') || ua.includes('fxios/')) return 'firefox';
  if (ua.includes('chrome/') || ua.includes('crios/')) return 'chrome';
  if (ua.includes('safari/')) return 'safari';
  return 'other';
}

export function kindsLabel(kinds: MediaKind[]): string {
  if (kinds.length === 2) return 'à câmera e ao microfone';
  return kinds[0] === 'camera' ? 'à câmera' : 'ao microfone';
}

/** Passos para desbloquear o acesso em cada navegador (o site não consegue fazer isso sozinho). */
export function permissionSteps(browser: BrowserFamily, kinds: MediaKind[]): string[] {
  const what = kinds.length === 2 ? 'Câmera e Microfone' : kinds[0] === 'camera' ? 'Câmera' : 'Microfone';
  switch (browser) {
    case 'chrome':
    case 'edge':
      return [
        'Clique no ícone à esquerda do endereço do site (cadeado ou controles), na barra de endereço.',
        `Em ${what}, escolha "Permitir".`,
        'Se o navegador pedir, recarregue a página.',
      ];
    case 'firefox':
      return [
        'Clique no ícone de câmera ou microfone riscado na barra de endereço.',
        'Remova o bloqueio ("Bloqueado temporariamente" ou "Bloqueado").',
        'Clique em "Permitir acesso" abaixo e confirme no pedido do navegador.',
      ];
    case 'safari':
      return [
        'No menu Safari, abra "Ajustes para este site" (no iPhone/iPad: botão "aA" na barra de endereço).',
        `Em ${what}, escolha "Permitir".`,
        'Recarregue a página.',
      ];
    default:
      return [
        'Abra as configurações do site no navegador (geralmente pelo ícone ao lado do endereço).',
        `Permita ${what.toLowerCase()} para este site.`,
        'Recarregue a página.',
      ];
  }
}
