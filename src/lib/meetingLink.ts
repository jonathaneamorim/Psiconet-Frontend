/**
 * Link externo de videochamada (Meet, Zoom...) pronto para usar em `href`. Espelha a validação do
 * backend (MeetingFieldsValidator): só http/https com host, sem espaços nem credenciais; sem esquema
 * recebe https://. Qualquer outra coisa (javascript:, data:, ...) devolve null e o link não é renderizado.
 * Use sempre com target="_blank" e rel="noopener noreferrer".
 */
export const MEETING_LINK_MAX_LENGTH = 255;

const SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):(?!\d)/;

export function toSafeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let link = raw.trim();
  if (!link || link.length > MEETING_LINK_MAX_LENGTH || /[\s\u0000-\u001f\u007f]/.test(link)) return null;

  const scheme = SCHEME.exec(link)?.[1]?.toLowerCase();
  if (scheme && scheme !== 'http' && scheme !== 'https') return null;
  if (!scheme) link = `https://${link}`;

  try {
    const url = new URL(link);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Validação do campo no formulário (mesma regra do backend), com a mensagem a exibir. */
export function validateExternalMeetingLink(raw: string): string | null {
  if (!raw.trim()) return 'Informe o link da chamada de vídeo (ex.: Google Meet, Zoom).';
  if (raw.trim().length > MEETING_LINK_MAX_LENGTH) {
    return `O link da chamada deve ter no máximo ${MEETING_LINK_MAX_LENGTH} caracteres.`;
  }
  return toSafeExternalUrl(raw) ? null : 'Informe um link válido que comece com https:// (ex.: Google Meet ou Zoom).';
}
