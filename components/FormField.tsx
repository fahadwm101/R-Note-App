import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type: 'text' | 'date' | 'datetime-local' | 'url' | 'textarea' | 'select';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    options?: { value: string; label: string }[]; // for select
    placeholder?: string;
    required?: boolean;
    rows?: number; // for textarea
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type,
    value,
    onChange,
    options = [],
    placeholder,
    required = false,
    rows = 3
}) => {
    const baseClasses = "mt-1 block w-full rounded-md border-slate-300 dark:border-gray-600/70 bg-white dark:bg-gray-700/60 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-slate-900 dark:text-white";

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    required={required}
                    aria-label={label}
                    className={baseClasses}
                />
            ) : type === 'select' ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    aria-label={label}
                    className={baseClasses}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <>
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        aria-label={label}
                        className={baseClasses}
                        list={options.length > 0 ? `${name}-list` : undefined}
                    />
                    {options.length > 0 && (
                        <datalist id={`${name}-list`}>
                            {options.map(option => (
                                <option key={option.value} value={option.value} />
                            ))}
                        </datalist>
                    )}
                </>
            )}
        </div>
    );
};

export default FormField;