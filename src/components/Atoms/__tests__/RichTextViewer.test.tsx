import { render, screen } from '@testing-library/react';
import { RichTextViewer } from '../RichTextViewer';
import type { RichTextDoc } from '@/types/medicalRecord';

describe('RichTextViewer', () => {
  it('renderiza a estrutura permitida', () => {
    const doc: RichTextDoc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Sessão 4' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'importante', marks: [{ type: 'bold' }, { type: 'underline' }] }] },
        { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'primeiro' }] }] }] },
      ],
    };
    const { container } = render(<RichTextViewer doc={doc} />);
    expect(screen.getByRole('heading', { name: 'Sessão 4' })).toBeInTheDocument();
    expect(container.querySelector('strong u, u strong')).toHaveTextContent('importante');
    expect(screen.getByRole('listitem')).toHaveTextContent('primeiro');
  });

  it('trata HTML como texto e ignora nós desconhecidos', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] },
        { type: 'image', attrs: { src: 'javascript:alert(1)' } },
      ],
    } as unknown as RichTextDoc;
    const { container } = render(<RichTextViewer doc={doc} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });

  it('mostra traço para documento vazio', () => {
    render(<RichTextViewer doc={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('aplica alinhamento e tamanho de fonte da lista e ignora valores livres', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [
          { type: 'text', text: 'grande', marks: [{ type: 'textStyle', attrs: { fontSize: '24px' } }] },
        ] },
        { type: 'heading', attrs: { level: 2, textAlign: 'right' }, content: [{ type: 'text', text: 'Direita' }] },
        { type: 'paragraph', attrs: { textAlign: 'justify;position:fixed' }, content: [
          { type: 'text', text: 'livre', marks: [{ type: 'textStyle', attrs: { fontSize: '999px' } }] },
        ] },
      ],
    } as unknown as RichTextDoc;
    render(<RichTextViewer doc={doc} />);

    expect(screen.getByText('grande')).toHaveStyle({ fontSize: '24px' });
    expect(screen.getByText('grande').closest('p')).toHaveStyle({ textAlign: 'center' });
    expect(screen.getByRole('heading', { name: 'Direita' })).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByText('livre').closest('p')).not.toHaveAttribute('style');
    expect(screen.getByText('livre').tagName).toBe('P');
  });
});
