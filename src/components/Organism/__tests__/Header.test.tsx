import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { RoleEnum } from '@/enums/RoleEnum';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/actions/logout', () => ({ logoutAction: jest.fn() }));
jest.mock('../NotificationsDropdown', () => ({ NotificationsDropdown: () => null }));

describe('Header — menu do usuário', () => {
  it('mostra "Suporte" acima de "Sair" para paciente', () => {
    const { container } = render(<Header userRole={RoleEnum.PATIENT} />);
    const links = screen.getAllByRole('link', { name: /Suporte/ });
    expect(links[0]).toHaveAttribute('href', '/support');

    const html = container.innerHTML;
    expect(html.indexOf('Suporte · Meus chamados')).toBeLessThan(html.indexOf('Sair da Conta'));
  });

  it('mostra "Suporte" para psicólogo e não para administrador', () => {
    const { unmount } = render(<Header userRole={RoleEnum.PSYCHOLOGIST} />);
    expect(screen.getAllByRole('link', { name: /Suporte/ }).length).toBeGreaterThan(0);
    unmount();
    render(<Header userRole={RoleEnum.ADMIN} />);
    expect(screen.queryByRole('link', { name: /Suporte/ })).toBeNull();
  });

  it('mostra a foto e o nome do usuário no menu desktop e no mobile', () => {
    render(
      <Header
        userRole={RoleEnum.PATIENT}
        user={{ fullName: 'Ana Souza', photoUrl: 'https://cdn.example.com/ana.jpg' }}
      />
    );
    const photos = screen.getAllByAltText('Foto de Ana Souza');
    expect(photos).toHaveLength(2);
    photos.forEach((img) => expect(img).toHaveAttribute('src', 'https://cdn.example.com/ana.jpg'));
    expect(screen.getAllByText('Ana Souza')).toHaveLength(2);
  });

  it('sem foto mantém o ícone padrão e o rótulo "Minha Conta"', () => {
    render(<Header userRole={RoleEnum.PSYCHOLOGIST} user={{ fullName: null, photoUrl: null }} />);
    expect(screen.queryByRole('img', { name: /Foto/ })).toBeNull();
    expect(screen.getAllByText('Minha Conta')).toHaveLength(2);
  });
});
