import { type ButtonHTMLAttributes, type ReactNode } from 'react';

/* ---- Spinner ---- */
function Spinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const px = { sm: 14, md: 16, lg: 20 }[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---- Types ---- */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

/* ---- Style maps ---- */

const variantStyles: Record<Variant, string> = {
  primary: [
    'bg-blue-600 text-white',
    'hover:bg-blue-700',
    'active:bg-blue-800',
  ].join(' '),

  secondary: [
    'bg-blue-100 text-blue-900',
    'hover:bg-blue-200',
    'active:bg-blue-300',
  ].join(' '),

  outline: [
    'border border-white/30 bg-transparent text-white',
    'hover:border-blue-400 hover:text-blue-200 hover:bg-blue-600/20',
    'active:bg-blue-600/30',
  ].join(' '),

  ghost: [
    'bg-blue-600 text-white',
    'hover:bg-blue-700',
    'active:bg-blue-800',
  ].join(' '),

  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'active:bg-red-800',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
  md: 'px-4 py-2 text-base gap-2 rounded-lg',
  lg: 'px-6 py-3 text-lg gap-2.5 rounded-lg',
};

/* ---- Component ---- */

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isDisabled || undefined}
      className={[
        // layout
        'inline-flex items-center justify-center',
        // transitions
        'transition-all duration-200 ease-in-out',
        // focus ring — branded
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
        // cursor
        'cursor-pointer',
        // disabled
        isDisabled && 'opacity-50 pointer-events-none',
        // width
        fullWidth && 'w-full',
        // variant + size
        variantStyles[variant],
        sizeStyles[size],
        // font
        'font-medium leading-none select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Left icon or spinner */}
      {isLoading ? (
        <Spinner size={size} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      {/* Label — keep in DOM while loading to stabilise width */}
      {isLoading ? (
        <>
          <span className="opacity-0 h-0 overflow-hidden" aria-hidden="true">
            {children}
          </span>
          <span>{children}</span>
        </>
      ) : (
        <span>{children}</span>
      )}

      {/* Right icon — hide while loading */}
      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
