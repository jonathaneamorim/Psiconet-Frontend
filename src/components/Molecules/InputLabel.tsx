type Props = {
    fieldName: string;
    htmlFor: string;
    inputType?: string;
    required?: boolean;
    labelStyle?: string;
    inputStyle?: string;
};

export function InputLabel({ fieldName, htmlFor, inputType, required, labelStyle, inputStyle }: Props) {
    return (
         <div className="">
            <label 
                htmlFor={htmlFor} 
                className={`block text-xl font-medium text-heading ${labelStyle || ''}`}>
                    {fieldName}
            </label>

            <input 
                id={htmlFor} type={inputType || "text"} 
                className={`border text-heading text-sm rounded-lg block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${inputStyle || ''}`} 
                required={!!required} />
        </div>
    );
}