import { useId } from "react";

type Props = {
    fieldName: string;
    name: string;
    inputType?: string;
    required?: boolean;
    labelStyle?: string;
    inputStyle?: string;
    placeholder?: string
};

export function InputLabel({ fieldName, name, inputType, required, labelStyle, inputStyle, placeholder }: Props) {

    const id = useId();

    return (
         <div className="">
            <label 
                htmlFor={id} 
                className={`block text-lg italic font-medium text-heading ${labelStyle || ''}`}>
                    {fieldName}
            </label>

            <input 
                id={id} 
                type={inputType || "text"} 
                name={name}
                className={`border text-heading text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${inputStyle || ''}`} 
                required={!!required} 
                placeholder={placeholder}/>
        </div>
    );
}