import { render, screen } from '@testing-library/react';
import { AppointmentStatusBadge } from '../AppointmentStatusBadge';
import { MeetingTypeBadge } from '../MeetingTypeBadge';

describe('Appointment Badges', () => {
  describe('AppointmentStatusBadge', () => {
    it('renders ACCEPTED status correctly', () => {
      render(<AppointmentStatusBadge status="ACCEPTED" />);
      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });

    it('renders CANCELLED status correctly', () => {
      render(<AppointmentStatusBadge status="CANCELLED" />);
      expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });

    it('renders COMPLETED status correctly', () => {
      render(<AppointmentStatusBadge status="COMPLETED" />);
      expect(screen.getByText('Realizada')).toBeInTheDocument();
    });

    it('renders NO_SHOW status correctly', () => {
      render(<AppointmentStatusBadge status="NO_SHOW" />);
      expect(screen.getByText('Não Compareceu')).toBeInTheDocument();
    });
  });

  describe('MeetingTypeBadge', () => {
    it('renders VIDEO_CALL correctly', () => {
      render(<MeetingTypeBadge type="VIDEO_CALL" />);
      expect(screen.getByText('Online (Vídeo)')).toBeInTheDocument();
    });

    it('renders IN_PERSON correctly', () => {
      render(<MeetingTypeBadge type="IN_PERSON" />);
      expect(screen.getByText('Presencial')).toBeInTheDocument();
    });
  });
});
