type Props = {
    variant?: string,
    children: React.ReactNode,
    type?: "button" | "submit" | "reset",
    onClick?: () => void,
    className?: string,
    disabled?: boolean
};

export function Button({ disabled = false, variant = 'primary', children, onClick, type = "button", className }: Props) {

    const variantStyles = {
        primary: 'bg-[var(--primary)] text-[var(--secondary)] hover:bg-[var(--primary-hover)] rounded-2xl',
        secondary: 'bg-[var(--secondary)] text-[var(--tertiary)] hover:bg-[var(--secondary-hover)] rounded-2xl',
        tertiary: 'bg-[#D9D9D9] text-[var(--tertiary)] hover:bg-[#BFBFBF] rounded-xl',
    };

    return (
        <button
            onClick={onClick}
            type={type}
            className={`w-full text-base flex items-center justify-center px-4 py-3 whitespace-nowrap ${variantStyles[variant as keyof typeof variantStyles]} transition-colors duration-300 ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}