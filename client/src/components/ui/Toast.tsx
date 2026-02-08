import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/* ============================================
 * FridgeTrack — Toast Notification System
 * ============================================
 * Context-driven toast notifications with
 * auto-dismiss, stacking, and progress bar.
 * ============================================ */


// ---- Types ----

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
  duration: number;
  exiting: boolean;
}

interface ToastAPI {
  success: (message: string, duration?: number) => void;
  error:   (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info:    (message: string, duration?: number) => void;
  dismiss: (id: number) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

const EXIT_MS = 200;
const DEFAULT_DURATION = 5_000;


// ---- Icons (inline SVGs, 18×18) ----

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.54-9.46a.75.75 0 0 0-1.08-1.08L9 10.94 7.54 9.46a.75.75 0 0 0-1.08 1.08l2 2a.75.75 0 0 0 1.08 0l4-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7.47 7.47a.75.75 0 0 1 1.06 0L10 8.94l1.47-1.47a.75.75 0 1 1 1.06 1.06L11.06 10l1.47 1.47a.75.75 0 1 1-1.06 1.06L10 11.06l-1.47 1.47a.75.75 0 0 1-1.06-1.06L8.94 10 7.47 8.53a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8.49 2.86a1.75 1.75 0 0 1 3.02 0l6.25 10.83A1.75 1.75 0 0 1 16.25 16H3.75a1.75 1.75 0 0 1-1.51-2.31L8.49 2.86ZM10 7a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 10 7Zm0 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM10 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM10 9a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 1.5 0v-4A.75.75 0 0 0 10 9Z"
        fill="currentColor"
      />
    </svg>
  );
}


// ---- Style maps ----

const variantStyles: Record<ToastVariant, { bg: string; icon: string; progress: string }> = {
  success: {
    bg:       'bg-success-light border-success',
    icon:     'text-success-dark',
    progress: 'bg-success',
  },
  error: {
    bg:       'bg-danger-light border-danger',
    icon:     'text-danger-dark',
    progress: 'bg-danger',
  },
  warning: {
    bg:       'bg-warning-light border-warning',
    icon:     'text-warning-dark',
    progress: 'bg-warning',
  },
  info: {
    bg:       'bg-info-light border-info',
    icon:     'text-info-dark',
    progress: 'bg-info',
  },
};

const variantIcons: Record<ToastVariant, () => ReactNode> = {
  success: CheckIcon,
  error:   ErrorIcon,
  warning: WarningIcon,
  info:    InfoIcon,
};


// ---- Context ----

const ToastContext = createContext<ToastContextValue | null>(null);


// ---- Single Toast ----

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const styles = variantStyles[item.variant];
  const Icon = variantIcons[item.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto w-full',
        'flex items-start gap-3 rounded-lg border p-3.5',
        'shadow-medium',
        styles.bg,
      ].join(' ')}
      style={{
        animation: item.exiting
          ? `toast-exit ${EXIT_MS}ms ease-in forwards`
          : 'toast-enter 250ms ease-out',
      }}
    >
      {/* Icon */}
      <span className={['shrink-0 mt-0.5', styles.icon].join(' ')}>
        <Icon />
      </span>

      {/* Message */}
      <p
        className="flex-1 min-w-0 text-sm font-medium leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {item.message}
      </p>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className={[
          'shrink-0 -m-1 p-1 rounded-md',
          'opacity-50 hover:opacity-100',
          'transition-opacity duration-150',
          'cursor-pointer',
        ].join(' ')}
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Progress bar */}
      {!item.exiting && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-lg"
        >
          <div
            className={['h-full opacity-40', styles.progress].join(' ')}
            style={{
              animation: `toast-progress ${item.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}


// ---- Toast Container ----

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className={[
        'fixed top-4 z-[9999]',
        'pointer-events-none',
        // Mobile: centered with padding
        'left-4 right-4',
        // Desktop: top-right, fixed width
        'sm:left-auto sm:right-4 sm:w-[22rem]',
      ].join(' ')}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}


// ---- Provider ----

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );

    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);

    // Clear auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const add = useCallback(
    (variant: ToastVariant, message: string, duration: number = DEFAULT_DURATION) => {
      const id = ++nextId;
      const item: ToastItem = { id, variant, message, duration, exiting: false };

      setToasts((prev) => [...prev, item]);

      // Auto-dismiss
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const toast: ToastAPI = {
    success: (msg, dur) => add('success', msg, dur),
    error:   (msg, dur) => add('error', msg, dur),
    warning: (msg, dur) => add('warning', msg, dur),
    info:    (msg, dur) => add('info', msg, dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}


// ---- Hook ----

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx.toast;
}
