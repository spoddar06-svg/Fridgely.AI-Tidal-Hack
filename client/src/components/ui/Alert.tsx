import { type HTMLAttributes, type ReactNode, useState } from 'react';

/* ---- Types ---- */

type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/* ---- Icons (inline SVGs, 20×20) ---- */

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.54-9.46a.75.75 0 0 0-1.08-1.08L9 10.94 7.54 9.46a.75.75 0 0 0-1.08 1.08l2 2a.75.75 0 0 0 1.08 0l4-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ExclamationTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8.49 2.86a1.75 1.75 0 0 1 3.02 0l6.25 10.83A1.75 1.75 0 0 1 16.25 16H3.75a1.75 1.75 0 0 1-1.51-2.31L8.49 2.86ZM10 7a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 10 7Zm0 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7.47 7.47a.75.75 0 0 1 1.06 0L10 8.94l1.47-1.47a.75.75 0 1 1 1.06 1.06L11.06 10l1.47 1.47a.75.75 0 1 1-1.06 1.06L10 11.06l-1.47 1.47a.75.75 0 0 1-1.06-1.06L8.94 10 7.47 8.53a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM10 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM10 9a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 1.5 0v-4A.75.75 0 0 0 10 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---- Style maps ---- */

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-success-light border-l-success text-success-dark',
  warning: 'bg-warning-light border-l-warning text-warning-dark',
  danger:  'bg-danger-light border-l-danger text-danger-dark',
  info:    'bg-info-light border-l-info text-info-dark',
};

const variantIcons: Record<AlertVariant, () => ReactNode> = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger:  XCircleIcon,
  info:    InfoCircleIcon,
};

/* ---- Component ---- */

export default function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  ...rest
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  if (!visible) return null;

  const Icon = variantIcons[variant];

  function handleDismiss() {
    setFading(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 200);
    return () => clearTimeout(timer);
  }

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 rounded-lg border border-l-4 p-4',
        'transition-opacity duration-200 ease-in-out',
        fading && 'opacity-0',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Icon */}
      <span className="shrink-0 mt-0.5">
        <Icon />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-semibold text-sm mb-1">{title}</p>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={[
            'shrink-0 -m-1 p-1 rounded-md',
            'opacity-60 hover:opacity-100',
            'transition-opacity duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
            'cursor-pointer',
          ].join(' ')}
          aria-label="Dismiss alert"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
