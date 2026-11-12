import { act, fireEvent, render, screen } from '@testing-library/react';
import { FormRegister } from '../FormRegister';
import { registerAction } from '@/actions/register';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }) }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { error: jest.fn(), loading: jest.fn(), success: jest.fn() } }));
jest.mock('@/actions/register', () => ({ registerAction: jest.fn() }));

const register = registerAction as jest.Mock;

function fill(birthDate = '1990-01-01') {
  fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'Maria Silva' } });
  fireEvent.change(screen.getByLabelText('Data de Nascimento'), { target: { value: birthDate } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@Forte1' } });
  fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Senha@Forte1' } });
}

describe('FormRegister — aceite dos documentos', () => {
  beforeEach(() => register.mockReset());

  it('checkboxes não vêm marcados e os links abrem em nova aba', () => {
    render(<FormRegister termsVersion="1.0.0" privacyVersion="1.0.0" />);
    expect(screen.getByRole('checkbox', { name: /Li e concordo/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /dados de saúde/ })).not.toBeChecked();
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('target', '_blank');
  });

  it('não envia sem aceite e mostra erro claro', async () => {
    render(<FormRegister termsVersion="1.0.0" privacyVersion="1.0.0" />);
    fill();
    await act(async () => { fireEvent.submit(screen.getByRole('button', { name: /Criar conta/ }).closest('form')!); });
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByText(/é preciso concordar com os Termos de Uso/)).toBeInTheDocument();
    expect(screen.getByText(/autorize o tratamento dos seus dados de saúde/)).toBeInTheDocument();
  });

  it('psicólogo também vê o consentimento de dados de saúde', () => {
    render(<FormRegister termsVersion="1.0.0" privacyVersion="1.0.0" />);
    fireEvent.click(screen.getByRole('button', { name: 'Sou Psicólogo' }));
    expect(screen.getByRole('checkbox', { name: /dados de saúde/ })).toBeInTheDocument();
  });

  it('menor de 18 anos é barrado já no formulário', async () => {
    render(<FormRegister termsVersion="1.0.0" privacyVersion="1.0.0" />);
    const today = new Date();
    fill(`${today.getFullYear() - 17}-01-01`);
    await act(async () => { fireEvent.submit(screen.getByRole('button', { name: /Criar conta/ }).closest('form')!); });
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByText(/18 anos ou mais/)).toBeInTheDocument();
  });

  it('envia as versões vistas junto com o aceite', async () => {
    register.mockResolvedValue({ success: true, redirectTo: '/login' });
    render(<FormRegister termsVersion="1.0.0" privacyVersion="1.2.0" />);
    fill();
    fireEvent.click(screen.getByRole('checkbox', { name: /Li e concordo/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /dados de saúde/ }));
    await act(async () => { fireEvent.submit(screen.getByRole('button', { name: /Criar conta/ }).closest('form')!); });
    const fd = register.mock.calls[0][0] as FormData;
    expect(fd.get('acceptTerms')).toBe('on');
    expect(fd.get('acceptHealthData')).toBe('on');
    expect(fd.get('termsVersion')).toBe('1.0.0');
    expect(fd.get('privacyVersion')).toBe('1.2.0');
  });

  it('sem versões carregadas, o cadastro fica bloqueado com aviso', () => {
    render(<FormRegister termsVersion={null} privacyVersion={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os Termos de Uso');
    expect(screen.getByRole('button', { name: /Criar conta/ })).toBeDisabled();
  });
});
