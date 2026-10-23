import { act, render, screen } from '@testing-library/react';
import { JoinCallButton } from '../JoinCallButton';
import type { AppointmentDTO } from '@/types/appointment';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const base: AppointmentDTO = {
  id: 'apt-1',
  startDateTime: '2026-10-23T14:00:00',
  endDateTime: '2026-10-23T14:50:00',
  meetingType: 'VIDEO_CALL',
  meetingProvider: 'IN_APP',
  status: 'ACCEPTED',
  joinOpensAt: '2026-10-23T13:50:00',
  joinClosesAt: '2026-10-23T15:05:00',
  patient: { id: 'p', fullName: 'Paciente' },
  psychologist: { id: 'ps', fullName: 'Psicóloga' },
  createdAt: '2026-10-20T10:00:00',
};

describe('JoinCallButton', () => {
  afterEach(() => jest.useRealTimers());

  it('Sala Psiconet antes da janela: botão desabilitado com horário e contagem regressiva', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-23T13:45:00'));
    render(<JoinCallButton appointment={base} />);

    const button = screen.getByRole('button', { name: /Disponível às 13:50/ });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Abre em 5 min 00 s/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('libera a entrada sozinho quando a janela abre', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-23T13:49:58'));
    render(<JoinCallButton appointment={base} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('link', { name: /Entrar na chamada/ })).toHaveAttribute('href', '/call/apt-1');
  });

  it('depois da janela informa que a sala foi encerrada', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-23T16:00:00'));
    render(<JoinCallButton appointment={base} />);
    expect(screen.getByText('Sala encerrada')).toBeInTheDocument();
  });

  it('link externo abre em nova aba com noopener noreferrer', () => {
    render(<JoinCallButton appointment={{ ...base, meetingProvider: 'EXTERNAL_LINK', meetingLink: 'meet.google.com/abc' }} />);
    const link = screen.getByRole('link', { name: /Entrar na chamada/ });
    expect(link).toHaveAttribute('href', 'https://meet.google.com/abc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('não renderiza link externo inseguro nem consulta presencial', () => {
    const { container, rerender } = render(
      <JoinCallButton appointment={{ ...base, meetingProvider: 'EXTERNAL_LINK', meetingLink: 'javascript:alert(1)' }} />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<JoinCallButton appointment={{ ...base, meetingType: 'IN_PERSON' }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
