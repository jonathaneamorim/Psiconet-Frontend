import { toSafeExternalUrl, validateExternalMeetingLink } from '../meetingLink';

describe('toSafeExternalUrl', () => {
  it('mantém http/https e completa https:// quando falta o esquema', () => {
    expect(toSafeExternalUrl('https://meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij');
    expect(toSafeExternalUrl('http://intranet.example.com/sala')).toBe('http://intranet.example.com/sala');
    expect(toSafeExternalUrl('  zoom.us/j/123  ')).toBe('https://zoom.us/j/123');
    expect(toSafeExternalUrl('meet.example.com:8443/x')).toBe('https://meet.example.com:8443/x');
  });

  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox',
    'file:///etc/passwd',
    'ftp://example.com',
    'https://usuario:senha@evil.example.com',
    'https://meet google.com',
    '',
    null,
    undefined,
  ])('recusa link inseguro ou inválido: %p', (link) => {
    expect(toSafeExternalUrl(link as string | null | undefined)).toBeNull();
  });

  it('recusa link acima do limite do backend', () => {
    expect(toSafeExternalUrl(`https://example.com/${'a'.repeat(260)}`)).toBeNull();
  });
});

describe('validateExternalMeetingLink', () => {
  it('exige o link e aponta link inválido', () => {
    expect(validateExternalMeetingLink('   ')).toMatch(/Informe o link/);
    expect(validateExternalMeetingLink('javascript:alert(1)')).toMatch(/https:\/\//);
    expect(validateExternalMeetingLink('https://meet.google.com/x')).toBeNull();
  });
});
