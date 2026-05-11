import { useId } from "react";

type Props = {
    fieldName: string;
    name: string;
    inputType?: string;
    required?: boolean;
    labelStyle?: string;
    inputStyle?: string;
    placeholder?: string;
    error?: string;
    onClearError?: () => void;
};

export function InputLabel({ fieldName, name, inputType, required, labelStyle, inputStyle, placeholder, error, onClearError }: Props) {

    const id = useId();

    return (
         <div className="flex flex-col gap-1">
            {error && (
                <span className="mt-2 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-1.5 animate-pulse-once">
                    ⚠ {error}
                </span>
            )}
            <label 
                htmlFor={id} 
                className={`block text-lg italic font-medium text-heading ${labelStyle || ''}`}>
                    {fieldName}
            </label>

            <input 
                id={id} 
                type={inputType || "text"} 
                name={name}
                className={`border text-heading text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-body transition-colors ${
                    error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-300' : ''
                } ${inputStyle || ''}`} 
                required={!!required} 
                placeholder={placeholder}
                onFocus={onClearError}
            />
        </div>
    );
}