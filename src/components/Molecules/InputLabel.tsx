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
                className={`block text-sm font-semibold text-slate-700 text-left ${labelStyle || ''}`}>
                    {fieldName}
            </label>

            <input 
                id={id} 
                type={inputType || "text"} 
                name={name}
                className={`border border-slate-200 bg-slate-50 text-slate-900 text-sm rounded-xl block w-full px-4 py-3 shadow-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-300' : ''
                } ${inputStyle || ''}`} 
                required={!!required} 
                placeholder={placeholder}
                onFocus={onClearError}
            />
        </div>
    );
}