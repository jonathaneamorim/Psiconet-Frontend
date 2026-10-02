import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { CookieBanner } from '../CookieBanner';
import { Footer } from '../Footer';
import { CookieConsentProvider, useCookieConsent } from '@/contexts/CookieConsentContext';
import { saveCookieConsentAction } from '@/actions/cookieConsent';
import type { CookieConsent } from '@/lib/cookieConsent';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/actions/cookieConsent', () => ({ saveCookieConsentAction: jest.fn() }));

const save = saveCookieConsentAction as jest.Mock;
const stored = (categories: CookieConsent['categories']): CookieConsent => ({ version: '1.0.0', categories, date: '2026-10-02T12:00:00.000Z' });

function Probe() {
  const { hasConsent } = useCookieConsent();
  return <span data-testid="stats">{hasConsent('statistics') ? 'sim' : 'nao'}</span>;
}

function renderWith(initialConsent: CookieConsent | null, policyVersion: string | null = '1.0.0') {
  return render(
    <CookieConsentProvider initialConsent={initialConsent} policyVersion={policyVersion}>
      <Footer />
      <Probe />
      <CookieBanner />
    </CookieConsentProvider>
  );
}

const banner = () => screen.queryByRole('region', { name: 'Cookies na Psiconet' });

describe('Banner de cookies', () => {
  beforeEach(() => save.mockReset());

  it('aparece no primeiro acesso com três ações de mesmo destaque', () => {
    renderWith(null);
    expect(banner()).toBeInTheDocument();
    const actions = ['Rejeitar não essenciais', 'Personalizar', 'Aceitar todos'].map((name) => screen.getByRole('button', { name }));
    const classes = new Set(actions.map((b) => b.className));
    expect(classes.size).toBe(1);
    expect(within(banner()!).getByRole('link', { name: 'Política de Cookies' })).toHaveAttribute('href', '/cookies');
  });

  it('não aparece quando a escolha da versão vigente já foi feita', () => {
    renderWith(stored(['necessary']));
    expect(banner()).not.toBeInTheDocument();
  });

  it('não aparece se a versão da política não pôde ser carregada (não há como registrar)', () => {
    renderWith(null, null);
    expect(banner()).not.toBeInTheDocument();
  });

  it('"Aceitar todos" grava e some; nenhuma categoria opcional existe hoje', async () => {
    save.mockResolvedValue({ consent: stored(['necessary']) });
    renderWith(null);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Aceitar todos' })); });
    expect(save).toHaveBeenCalledWith(['necessary']);
    expect(banner()).not.toBeInTheDocument();
    expect(screen.getByTestId('stats')).toHaveTextContent('nao');
  });

  it('"Rejeitar não essenciais" grava só os necessários', async () => {
    save.mockResolvedValue({ consent: stored(['necessary']) });
    renderWith(null);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Rejeitar não essenciais' })); });
    expect(save).toHaveBeenCalledWith(['necessary']);
    expect(banner()).not.toBeInTheDocument();
  });

  it('"Personalizar" abre o modal com necessários travados e categorias inexistentes desabilitadas', async () => {
    save.mockResolvedValue({ consent: stored(['necessary']) });
    renderWith(null);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));

    const dialog = screen.getByRole('dialog', { name: 'Preferências de cookies' });
    expect(dialog).toBeInTheDocument();
    const necessary = screen.getByLabelText('Estritamente necessários');
    expect(necessary).toBeChecked();
    expect(necessary).toBeDisabled();
    expect(screen.getByLabelText('Marketing')).not.toBeChecked();
    expect(screen.getByLabelText('Marketing')).toBeDisabled();
    expect(screen.getByText('psiconet_refresh')).toBeInTheDocument();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvar escolhas' })); });
    expect(save).toHaveBeenCalledWith(['necessary']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pode ser reaberto pelo rodapé depois da escolha (revogar é tão fácil quanto aceitar)', () => {
    renderWith(stored(['necessary']));
    fireEvent.click(screen.getByRole('button', { name: 'Preferências de cookies' }));
    expect(screen.getByRole('dialog', { name: 'Preferências de cookies' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('falha ao gravar mantém o banner e mostra o erro', async () => {
    save.mockResolvedValue({ error: 'Não foi possível registrar sua escolha agora.' });
    renderWith(null);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Aceitar todos' })); });
    expect(banner()).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível registrar');
  });

  it('rodapé tem os links legais e o aviso de emergência', () => {
    renderWith(stored(['necessary']));
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByText(/CVV — 188/)).toBeInTheDocument();
  });
});
