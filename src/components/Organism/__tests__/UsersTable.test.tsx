import { render, screen, within } from '@testing-library/react';
import { UsersTable } from '../UsersTable';
import type { AdminUser } from '@/types/admin';

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }) }));
jest.mock('@/actions/admin', () => ({
  updateUserStatusAction: jest.fn(),
  updateUserAction: jest.fn(),
  notifyUserAction: jest.fn(),
}));

const base: AdminUser = {
  id: '1', fullName: 'Ana Souza', email: 'ana@teste.com', maskedCpf: '•••.456.789-••',
  role: 'PATIENT', status: 'ACTIVE', createdAt: '2026-09-30T12:00:00Z', baseAdmin: false, lastLoginAt: null,
};

describe('UsersTable', () => {
  it('exibe nome, perfil, data de criação, situação e CPF mascarado', () => {
    render(<UsersTable users={[base]} />);
    const table = screen.getByRole('table');
    ['Nome', 'Perfil', 'Criado em', 'Situação', 'CPF'].forEach((h) =>
      expect(within(table).getByRole('columnheader', { name: h })).toBeInTheDocument());
    expect(within(table).getByText('•••.456.789-••')).toBeInTheDocument();
    expect(within(table).getByText('30/09/2026')).toBeInTheDocument();
    expect(within(table).getByText('Ativo')).toBeInTheDocument();
  });

  it('não oferece inativação do administrador base', () => {
    render(<UsersTable users={[{ ...base, id: '2', role: 'ADMIN', baseAdmin: true, fullName: 'Admin Base' }]} />);
    const table = screen.getByRole('table');
    expect(within(table).queryByRole('button', { name: /Inativar/ })).toBeNull();
    expect(within(table).getByText('Admin base')).toBeInTheDocument();
  });

  it('mostra estado vazio', () => {
    render(<UsersTable users={[]} />);
    expect(screen.getByText(/Nenhum usuário encontrado/)).toBeInTheDocument();
  });
});
