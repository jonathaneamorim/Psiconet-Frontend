type Props = {
    fieldName: string;
    htmlFor: string;
    inputType?: string;
    required?: boolean;
    labelStyle?: string;
    inputStyle?: string;
    placeholder?: string
};

export function InputLabel({ fieldName, htmlFor, inputType, required, labelStyle, inputStyle, placeholder }: Props) {
    return (
         <div className="">
            <label 
                htmlFor={htmlFor} 
                className={`block text-lg italic font-medium text-heading ${labelStyle || ''}`}>
                    {fieldName}
            </label>

            <input 
                id={htmlFor} 
                type={inputType || "text"} 
                name={htmlFor}
                className={`border text-heading text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${inputStyle || ''}`} 
                required={!!required} 
                placeholder={placeholder}/>
        </div>
    );
}