import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

/* ---- Types ---- */

type InputVariant = 'default' | 'error' | 'success';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/* ---- Style maps ---- */

const variantStyles: Record<InputVariant, string> = {
  default: [
    'border-neutral-200',
    'hover:border-brand-400',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
  ].join(' '),

  error: [
    'border-danger',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger',
  ].join(' '),

  success: [
    'border-success',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success',
  ].join(' '),
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-5 py-2.5 text-lg rounded-lg',
};

const iconSizeStyles: Record<InputSize, { left: string; right: string; inputLeft: string; inputRight: string }> = {
  sm: { left: 'left-2.5',  right: 'right-2.5',  inputLeft: 'pl-8',   inputRight: 'pr-8' },
  md: { left: 'left-3',    right: 'right-3',    inputLeft: 'pl-10',  inputRight: 'pr-10' },
  lg: { left: 'left-3.5',  right: 'right-3.5',  inputLeft: 'pl-11',  inputRight: 'pr-11' },
};

/* ---- Component ---- */

export default function Input({
  variant = 'default',
  inputSize = 'md',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  id,
  className = '',
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? (label ? `input-${autoId}` : undefined);
  const resolvedVariant: InputVariant = error ? 'error' : variant;
  const errorId = error ? `${autoId}-error` : undefined;
  const helperId = !error && helperText ? `${autoId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={fullWidth ? 'w-full' : 'inline-flex flex-col'}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <span
            className={[
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400',
              iconSizeStyles[inputSize].left,
            ].join(' ')}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'border bg-white text-neutral-900 placeholder:text-neutral-400',
            'transition-all duration-200 ease-in-out',
            'w-full',
            disabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
            variantStyles[resolvedVariant],
            sizeStyles[inputSize],
            leftIcon && iconSizeStyles[inputSize].inputLeft,
            rightIcon && iconSizeStyles[inputSize].inputRight,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />

        {/* Right icon */}
        {rightIcon && (
          <span
            className={[
              'absolute top-1/2 -translate-y-1/2 text-neutral-400',
              iconSizeStyles[inputSize].right,
            ].join(' ')}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error or helper text */}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
