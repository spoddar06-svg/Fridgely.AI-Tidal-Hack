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
  success: 'bg-green-600/30 text-green-200 border-green-400/30',
  warning: 'bg-yellow-600/30 text-yellow-200 border-yellow-400/30',
  danger:  'bg-red-600/30 text-red-200 border-red-400/30',
  info:    'bg-blue-600/30 text-blue-200 border-blue-400/30',
  neutral: 'bg-slate-800/50 text-slate-200 border-white/20',
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
