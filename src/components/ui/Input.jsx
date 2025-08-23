import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperTextClassName = '',
  startIcon,
  endIcon,
  ...props
}) => {
  const inputBaseClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500';
  const inputErrorClasses = 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:ring-red-700 dark:focus:ring-red-500';
  const inputDisabledClasses = 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed';
  const inputWithIconClasses = startIcon || endIcon ? 'pl-10 pr-10' : 'px-3';

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        
        <motion.input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`${inputBaseClasses} ${error ? inputErrorClasses : ''} ${
            disabled ? inputDisabledClasses : ''
          } ${inputWithIconClasses} ${inputClassName}`}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p 
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${helperTextClassName}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
