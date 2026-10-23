import { fireEvent, render, screen } from '@testing-library/react';
import { MeetingProviderSelector } from '../MeetingProviderSelector';

const noop = () => undefined;

describe('MeetingProviderSelector', () => {
  it('com a Sala Psiconet disponível mostra as duas opções e oculta o campo de link', () => {
    const onChange = jest.fn();
    render(
      <MeetingProviderSelector value="IN_APP" onChange={onChange} inAppAvailable meetingLink="" onMeetingLinkChange={noop} />
    );
    expect(screen.getByRole('radio', { name: /Sala Psiconet/ })).toBeChecked();
    expect(screen.queryByLabelText(/Link da Videochamada/)).not.toBeInTheDocument();
    expect(screen.getByText(/não grava/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Link externo/ }));
    expect(onChange).toHaveBeenCalledWith('EXTERNAL_LINK');
  });

  it('no modo externo exibe o campo de link e o erro acessível', () => {
    render(
      <MeetingProviderSelector value="EXTERNAL_LINK" onChange={noop} inAppAvailable meetingLink="" onMeetingLinkChange={noop}
        linkError="Informe o link" />
    );
    const input = screen.getByLabelText(/Link da Videochamada/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o link');
  });

  it('com a funcionalidade desligada só existe o link externo', () => {
    render(
      <MeetingProviderSelector value="IN_APP" onChange={noop} inAppAvailable={false} meetingLink="" onMeetingLinkChange={noop} />
    );
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Link da Videochamada/)).toBeInTheDocument();
  });
});
