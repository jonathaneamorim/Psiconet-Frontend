import { render, screen } from '@testing-library/react';
import { SessionNoteCard } from '../SessionNoteCard';
import type { SessionNote } from '@/types/medicalRecord';

const base: SessionNote = {
  id: 'n1', appointmentId: null, appointmentStart: null, type: 'RECORD', status: 'FINALIZED', title: 'Evolução',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Conteúdo' }] }] },
  authorName: 'Dra. Ana', authorCrp: '06/123456', integrityHash: 'a'.repeat(64), integrityVerified: true,
  createdAt: '2026-10-01T10:00:00', updatedAt: null, finalizedAt: '2026-10-01T11:00:00', editable: false, version: 1, addenda: [],
};

describe('SessionNoteCard', () => {
  it('exibe autor, CRP e selo de integridade da anotação finalizada', () => {
    render(<SessionNoteCard note={base} onAddendum={() => {}} />);
    expect(screen.getByText(/Dra\. Ana \(CRP 06\/123456\)/)).toBeInTheDocument();
    expect(screen.getByText(/Íntegro/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adendo/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continuar editando/ })).toBeNull();
  });

  it('alerta quando a integridade diverge', () => {
    render(<SessionNoteCard note={{ ...base, integrityVerified: false }} />);
    expect(screen.getByText(/Integridade divergente/)).toBeInTheDocument();
  });

  it('rascunho editável oferece continuar editando', () => {
    render(<SessionNoteCard note={{ ...base, status: 'DRAFT', editable: true, integrityHash: null }} onContinue={() => {}} />);
    expect(screen.getByRole('button', { name: /Continuar editando/ })).toBeInTheDocument();
  });
});
