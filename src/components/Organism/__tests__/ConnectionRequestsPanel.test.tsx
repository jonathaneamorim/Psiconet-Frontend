import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConnectionRequestsPanel } from '../ConnectionRequestsPanel';
import { ConnectionProvider } from '@/contexts/ConnectionContext';
import type { ConnectionRequest } from '@/types/connection';
import { acceptConnectionAction, rejectConnectionAction, removeConnectionAction } from '@/actions/connections';

jest.mock('next/link', () => {
  const Link = ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>;
  return { __esModule: true, default: Link };
});
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }) }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { error: jest.fn(), success: jest.fn() } }));
jest.mock('@/actions/connections', () => ({
  acceptConnectionAction: jest.fn(),
  rejectConnectionAction: jest.fn(),
  removeConnectionAction: jest.fn(),
}));

const accept = acceptConnectionAction as jest.Mock;
const reject = rejectConnectionAction as jest.Mock;
const remove = removeConnectionAction as jest.Mock;

const me = { id: 'me', fullName: 'Eu Mesmo', photoUrl: null, role: 'PATIENT' };

function request(id: string, sender: ConnectionRequest['sender'], receiver: ConnectionRequest['receiver']): ConnectionRequest {
  return { id, sender, receiver, status: 'PENDING', requestedAt: '2026-11-10T10:00:00', acceptedAt: null };
}

const received = [request('r1', { id: 'psy1', fullName: 'Dra. Ana', photoUrl: null, role: 'PSYCHOLOGIST' }, me)];
const sent = [request('s1', me, { id: 'psy2', fullName: 'Dr. Bruno', photoUrl: null, role: 'PSYCHOLOGIST' })];

function renderPanel(props: Partial<React.ComponentProps<typeof ConnectionRequestsPanel>> = {}) {
  return render(
    <ConnectionProvider>
      <ConnectionRequestsPanel received={received} sent={sent} receivedTotal={1} sentTotal={1} {...props} />
    </ConnectionProvider>
  );
}

describe('ConnectionRequestsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra as recebidas por padrão, com link para o perfil de quem pediu', () => {
    renderPanel();
    expect(screen.getByRole('tab', { name: /Recebidas/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: 'Dra. Ana' })).toHaveAttribute('href', '/psychologist/profile/psy1');
    expect(screen.queryByText('Dr. Bruno')).not.toBeInTheDocument();
  });

  it('abre na aba pedida pela URL e lista as enviadas', () => {
    renderPanel({ initialTab: 'enviadas' });
    expect(screen.getByRole('tab', { name: /Enviadas/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Dr. Bruno')).toBeInTheDocument();
    expect(screen.getByText(/Aguardando resposta/)).toBeInTheDocument();
  });

  it('aceitar remove a solicitação da lista', async () => {
    accept.mockResolvedValue({ success: true });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar solicitação de Dra. Ana' }));
    await waitFor(() => expect(screen.queryByText('Dra. Ana')).not.toBeInTheDocument());
    expect(accept).toHaveBeenCalledWith('r1');
  });

  it('erro ao recusar mantém a solicitação', async () => {
    reject.mockResolvedValue({ error: 'Falhou' });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Recusar solicitação de Dra. Ana' }));
    await waitFor(() => expect(reject).toHaveBeenCalledWith('r1'));
    expect(screen.getByText('Dra. Ana')).toBeInTheDocument();
  });

  it('cancelar enviada pede confirmação e remove da lista', async () => {
    remove.mockResolvedValue({ success: true });
    renderPanel({ initialTab: 'enviadas' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar solicitação enviada a Dr. Bruno' }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sim, cancelar' }));
    await waitFor(() => expect(screen.queryByText('Dr. Bruno')).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('s1');
  });

  it('listas vazias mostram mensagem própria', () => {
    renderPanel({ received: [], sent: [], receivedTotal: 0, sentTotal: 0 });
    expect(screen.getByText('Nenhuma solicitação recebida aguardando resposta.')).toBeInTheDocument();
  });
});
