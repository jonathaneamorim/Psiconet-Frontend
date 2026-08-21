import { render, screen, fireEvent } from '@testing-library/react';
import { LateralMenu } from '../LateralMenu';
import { RoleEnum } from '@/enums/RoleEnum';

// Mock do componente Link do Next.js
jest.mock('next/link', () => {
    return ({ children, href, className, title }: any) => {
        return (
            <a href={href} className={className} title={title} data-testid={`link-${title || 'unknown'}`}>
                {children}
            </a>
        );
    };
});

// Mock da action de logout
const mockLogoutAction = jest.fn();
jest.mock('@/actions/logout', () => ({
    logoutAction: () => mockLogoutAction()
}));

describe('LateralMenu Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render anything if userRole is null', () => {
        const { container } = render(<LateralMenu userRole={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render menu for logged in PSYCHOLOGIST', () => {
        render(<LateralMenu userRole={RoleEnum.PSYCHOLOGIST} />);
        
        expect(screen.getByTestId('lateral-menu')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Agenda de Consultas')).toBeInTheDocument();
        expect(screen.getByText('Pacientes')).toBeInTheDocument();
        expect(screen.getByText('Sair')).toBeInTheDocument();

        // Check exact href for dashboard and appointments
        const dashboardLink = screen.getByTestId('link-Dashboard');
        expect(dashboardLink).toHaveAttribute('href', '/psychologist/dashboard');

        const appointmentsLink = screen.getByTestId('link-Agenda de Consultas');
        expect(appointmentsLink).toHaveAttribute('href', '/psychologist/appointments');
    });

    it('should render menu for logged in PATIENT', () => {
        render(<LateralMenu userRole={RoleEnum.PATIENT} />);
        
        expect(screen.getByTestId('lateral-menu')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Consultas')).toBeInTheDocument();
        
        // Check exact href for dashboard and appointments
        const dashboardLink = screen.getByTestId('link-Dashboard');
        expect(dashboardLink).toHaveAttribute('href', '/patient/dashboard');

        const appointmentsLink = screen.getByTestId('link-Consultas');
        expect(appointmentsLink).toHaveAttribute('href', '/patient/appointments');
    });

    it('should trigger logout action when clicking Sair', async () => {
        render(<LateralMenu userRole={RoleEnum.PATIENT} />);
        
        const logoutBtn = screen.getByRole('button', { name: /Sair/i });
        fireEvent.click(logoutBtn);
        
        expect(mockLogoutAction).toHaveBeenCalledTimes(1);
    });
});
