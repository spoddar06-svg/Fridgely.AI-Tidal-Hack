import { type HTMLAttributes } from 'react';

/* ---- Types ---- */

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/* ---- Style maps ---- */

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success-dark border-success',
  warning: 'bg-warning-light text-warning-dark border-warning',
  danger:  'bg-danger-light text-danger-dark border-danger',
  info:    'bg-info-light text-info-dark border-info',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

/* ---- Component ---- */

export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium leading-none',
        'rounded-full border',
        'select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
