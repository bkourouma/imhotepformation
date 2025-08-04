import { forwardRef } from 'react';
import { clsx } from '../../utils/helpers';

const FormField = forwardRef(({ 
  label, 
  error, 
  required = false,
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label className={clsx('form-label', required && 'required')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;

// Input component
export const Input = forwardRef(({ 
  type = 'text',
  error,
  className,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(
        'form-input',
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

// Textarea component
export const Textarea = forwardRef(({ 
  error,
  className,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'form-input',
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

// Select component
export const Select = forwardRef(({ 
  options = [],
  error,
  className,
  placeholder,
  ...props 
}, ref) => {
  return (
    <select
      ref={ref}
      className={clsx(
        'form-input',
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';
