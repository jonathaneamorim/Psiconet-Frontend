import { render, screen } from '@testing-library/react';
import { AppointmentCard } from '../AppointmentCard';
import { CalendarGrid } from '@/components/Organism/CalendarGrid';
import type { AppointmentDTO, OverlapSummary } from '@/types/appointment';

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/components/Molecules/JoinCallButton', () => ({ JoinCallButton: () => null }));

const other: OverlapSummary = {
  id: 'apt-2', startDateTime: '2030-03-04T10:20:00', endDateTime: '2030-03-04T11:10:00', patientName: 'Bruno Outro',
};

function appointment(overrides: Partial<AppointmentDTO> = {}): AppointmentDTO {
  return {
    id: 'apt-1',
    startDateTime: '2030-03-04T10:00:00',
    endDateTime: '2030-03-04T10:50:00',
    meetingType: 'VIDEO_CALL',
    meetingProvider: 'EXTERNAL_LINK',
    meetingLink: 'https://meet.example.com/x',
    status: 'ACCEPTED',
    patient: { id: 'pat-1', fullName: 'Ana Paciente' },
    psychologist: { id: 'psy-1', fullName: 'Dra. Carla' },
    createdAt: '2030-01-01T00:00:00',
    ...overrides,
  };
}

describe('Sinalização de sobreposição (ADR 019)', () => {
  it('psicólogo vê o selo com texto acessível citando a outra consulta', () => {
    render(<AppointmentCard appointment={appointment({ hasOverlap: true, overlappingAppointments: [other] })} perspective="psychologist" />);
    expect(screen.getByText('Sobreposição')).toBeInTheDocument();
    expect(screen.getByText(/Mesmo horário de: Bruno Outro das 10:20 às 11:10/)).toBeInTheDocument();
  });

  it('paciente nunca vê o selo, mesmo que o campo chegasse por engano', () => {
    render(<AppointmentCard appointment={appointment({ hasOverlap: true, overlappingAppointments: [other] })} perspective="patient" />);
    expect(screen.queryByText('Sobreposição')).not.toBeInTheDocument();
    expect(screen.queryByText(/Bruno Outro/)).not.toBeInTheDocument();
  });

  it('sem sobreposição não há selo', () => {
    render(<AppointmentCard appointment={appointment({ hasOverlap: false, overlappingAppointments: [] })} perspective="psychologist" />);
    expect(screen.queryByText('Sobreposição')).not.toBeInTheDocument();
  });

  it('calendário desenha consultas simultâneas lado a lado (nenhuma escondida) e a série prevista do mesmo dia', () => {
    const first = appointment({ hasOverlap: true, overlappingAppointments: [other] });
    const second = appointment({
      id: 'apt-2', startDateTime: other.startDateTime, endDateTime: other.endDateTime,
      patient: { id: 'pat-2', fullName: 'Bruno Outro' }, hasOverlap: true,
      overlappingAppointments: [{ ...other, id: 'apt-1', patientName: 'Ana Paciente' }],
    });
    render(
      <CalendarGrid
        currentDate={new Date(2030, 2, 1)}
        selectedDate={new Date(2030, 2, 1)}
        appointments={[first, second]}
        virtualOccurrences={[{ recurrenceRuleId: 'r1', frequency: 'WEEKLY', startDateTime: '2030-03-04T10:30:00', hasOverlap: true }]}
        perspective="psychologist"
        onSelectDate={jest.fn()}
      />
    );
    expect(screen.getByText('Ana Paciente')).toBeInTheDocument();
    expect(screen.getByText('Bruno Outro')).toBeInTheDocument();
    expect(screen.getByText('Série Semanal')).toBeInTheDocument();
    // Selo compacto em cada item sobreposto (2 consultas + 1 ocorrência prevista)
    expect(screen.getAllByText(/Mesmo horário de|Horário com mais de uma consulta/)).toHaveLength(3);
  });

  it('calendário do paciente não mostra selo', () => {
    render(
      <CalendarGrid
        currentDate={new Date(2030, 2, 1)}
        selectedDate={new Date(2030, 2, 1)}
        appointments={[appointment({ hasOverlap: true, overlappingAppointments: [other] })]}
        perspective="patient"
        onSelectDate={jest.fn()}
      />
    );
    expect(screen.queryByText(/Mesmo horário de/)).not.toBeInTheDocument();
  });
});
