/**
 * @jest-environment node
 */
import { registerAction } from '@/actions/register';
import { apiClient } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  apiClient: { post: jest.fn() },
}));

const post = apiClient.post as jest.Mock;

function form(values: Record<string, string>) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const base = {
  userRole: 'patient',
  fullName: ' Maria Silva ',
  email: ' Maria@Teste.com ',
  cpf: '529.982.247-25',
  birthDate: '1995-01-01',
  password: 'Senha@Forte1',
  acceptTerms: 'on',
  acceptHealthData: 'on',
  termsVersion: '1.0.0',
  privacyVersion: '1.0.0',
};

describe('registerAction', () => {
  beforeEach(() => post.mockReset());

  it('cadastro novo redireciona para o login com e-mail pré-preenchido', async () => {
    post.mockResolvedValue({ data: { message: 'Conta criada', nextStep: 'LOGIN' }, status: 201 });

    const result = await registerAction(form(base));

    expect(post).toHaveBeenCalledWith(
      '/auth/register/patient',
      expect.objectContaining({ email: 'maria@teste.com', cpf: '52998224725', fullName: 'Maria Silva' }),
      { public: true }
    );
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/login?cadastro=sucesso&email=maria%40teste.com');
  });

  it('cadastro duplicado devolve erro e campos do backend', async () => {
    post.mockResolvedValue({ error: 'Este e-mail já está cadastrado.', status: 409, fieldErrors: { email: 'Este e-mail já está cadastrado.' } });

    const result = await registerAction(form(base));

    expect(result.success).toBeUndefined();
    expect(result.fields).toEqual({ email: 'Este e-mail já está cadastrado.' });
  });

  it('nunca envia role no corpo e usa o endpoint de psicólogo com CRP', async () => {
    post.mockResolvedValue({ data: { message: 'ok', nextStep: 'LOGIN' } });

    await registerAction(form({ ...base, userRole: 'psychologist', crp: ' 06/123456 ' }));

    const [path, payload] = post.mock.calls[0];
    expect(path).toBe('/auth/register/psychologist');
    expect(payload.crp).toBe('06/123456');
    expect(payload).not.toHaveProperty('role');
  });

  it('valor de papel desconhecido cai no cadastro de paciente', async () => {
    post.mockResolvedValue({ data: { message: 'ok', nextStep: 'LOGIN' } });
    await registerAction(form({ ...base, userRole: 'admin' }));
    expect(post.mock.calls[0][0]).toBe('/auth/register/patient');
  });

  it('envia o aceite, as versões vistas e os dados de saúde para paciente e psicólogo', async () => {
    post.mockResolvedValue({ data: { message: 'ok', nextStep: 'LOGIN' } });

    await registerAction(form(base));
    expect(post.mock.calls[0][1]).toEqual(expect.objectContaining({
      acceptTerms: true, acceptHealthData: true, termsVersion: '1.0.0', privacyVersion: '1.0.0',
    }));

    await registerAction(form({ ...base, userRole: 'psychologist', crp: '06/1' }));
    expect(post.mock.calls[1][1]).toEqual(expect.objectContaining({ acceptTerms: true, acceptHealthData: true }));
  });

  it('checkbox desmarcado vai como false (o backend recusa)', async () => {
    post.mockResolvedValue({ error: 'Para criar a conta...', status: 400, fieldErrors: { acceptTerms: 'x' } });
    const withoutAccept: Record<string, string> = { ...base };
    delete withoutAccept.acceptTerms;
    const result = await registerAction(form(withoutAccept));
    expect(post.mock.calls[0][1].acceptTerms).toBe(false);
    expect(result.fields).toEqual({ acceptTerms: 'x' });
  });
});
