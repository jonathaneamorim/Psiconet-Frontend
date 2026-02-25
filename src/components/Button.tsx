export function Button({ variant = 'primary', children, onClick }: { variant?: string; children: React.ReactNode; onClick: () => void }) {

    const variantStyles = {
        primary: 'bg-[var(--primary)] text-[var(--secondary)] hover:bg-[var(--primary-hover)] rounded-2xl',
        secondary: 'bg-[var(--secondary)] text-[var(--tertiary)] hover:bg-[var(--secondary-hover)] rounded-2xl',
        outline: 'bg-[#D9D9D9)] text-[var(--tertiary)] hover:bg-[#BFBFBF] rounded-xl',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full text-base flex items-center justify-center px-4 py-3 whitespace-nowrap ${variantStyles[variant as keyof typeof variantStyles]} transition-colors`}
        >
            {children}
        </button>
    );
}