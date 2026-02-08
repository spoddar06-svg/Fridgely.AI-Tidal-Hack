import { type HTMLAttributes } from 'react';

/* ============================================
 * FridgeTrack — Loading Skeletons
 * ============================================
 * Reusable shimmer skeletons for perceived-
 * performance loading states.
 * ============================================ */


// ---- Shimmer keyframes (injected once) ----

const SHIMMER_CSS = `
@keyframes skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

let styleInjected = false;

function injectShimmerStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SHIMMER_CSS;
  document.head.appendChild(style);
  styleInjected = true;
}


// ---- Shared shimmer style ----

const shimmerStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
  backgroundSize: '400px 100%',
  backgroundRepeat: 'no-repeat',
  animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
};


// ---- Primitives ----

interface SkeletonBaseProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

/**
 * Base skeleton block with shimmer animation.
 */
export function SkeletonBox({
  width,
  height,
  className = '',
  style: userStyle,
  ...rest
}: SkeletonBaseProps) {
  injectShimmerStyle();

  return (
    <div
      aria-hidden="true"
      className={[
        'bg-neutral-200 rounded-md',
        className,
      ].join(' ')}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        ...shimmerStyle,
        ...userStyle,
      }}
      {...rest}
    />
  );
}

interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  lines?: number;
  lineHeight?: string | number;
  gap?: string | number;
}

/**
 * Text-line skeleton. Renders `lines` shimmer bars
 * with the last line at 60% width for a natural feel.
 */
export function SkeletonText({
  width = '100%',
  lines = 1,
  lineHeight = '0.75rem',
  gap = '0.625rem',
  className = '',
  ...rest
}: SkeletonTextProps) {
  injectShimmerStyle();

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap, width: typeof width === 'number' ? `${width}px` : width }}
      {...rest}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="bg-neutral-200 rounded-sm"
          style={{
            height: lineHeight,
            width: i === lines - 1 && lines > 1 ? '60%' : '100%',
            ...shimmerStyle,
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCircleProps extends HTMLAttributes<HTMLDivElement> {
  size?: string | number;
}

/**
 * Circular skeleton for avatars or icon placeholders.
 */
export function SkeletonCircle({
  size = '2.5rem',
  className = '',
  style: userStyle,
  ...rest
}: SkeletonCircleProps) {
  injectShimmerStyle();

  const dim = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      aria-hidden="true"
      className={['bg-neutral-200 rounded-full shrink-0', className].join(' ')}
      style={{
        width: dim,
        height: dim,
        ...shimmerStyle,
        ...userStyle,
      }}
      {...rest}
    />
  );
}

interface SkeletonImageProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const imageRounding: Record<NonNullable<SkeletonImageProps['rounded']>, string> = {
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  full: 'rounded-full',
};

/**
 * Image placeholder skeleton with configurable rounding.
 */
export function SkeletonImage({
  width = '100%',
  height = '10rem',
  rounded = 'lg',
  className = '',
  style: userStyle,
  ...rest
}: SkeletonImageProps) {
  injectShimmerStyle();

  return (
    <div
      aria-hidden="true"
      className={['bg-neutral-200', imageRounding[rounded], className].join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...shimmerStyle,
        ...userStyle,
      }}
      {...rest}
    />
  );
}

interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

/**
 * Card-shaped skeleton matching Card component dimensions.
 */
export function SkeletonCard({
  lines = 3,
  className = '',
  ...rest
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'bg-white border border-neutral-200 rounded-xl p-5',
        className,
      ].join(' ')}
      {...rest}
    >
      <SkeletonBox height="0.875rem" width="45%" className="mb-3" />
      <SkeletonText lines={lines} gap="0.5rem" />
    </div>
  );
}


// ---- Composed Skeletons ----

/**
 * Matches the layout of an inventory item row:
 * circle icon | name + category + expiry | quantity badge
 */
export function InventoryItemSkeleton({
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={[
        'bg-white border border-neutral-200 rounded-xl p-5',
        'flex items-center gap-4',
        className,
      ].join(' ')}
      {...rest}
    >
      <SkeletonCircle size="2.75rem" />
      <div className="flex-1 min-w-0">
        <SkeletonBox height="0.875rem" width="55%" className="mb-2" />
        <SkeletonBox height="0.625rem" width="35%" className="mb-1.5" />
        <SkeletonBox height="0.625rem" width="25%" />
      </div>
      <SkeletonBox height="1.5rem" width="3rem" className="rounded-full shrink-0" />
    </div>
  );
}

/**
 * Matches the layout of a recipe card:
 * image | title + description + meta chips
 */
export function RecipeCardSkeleton({
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={[
        'bg-white border border-neutral-200 rounded-xl overflow-hidden',
        className,
      ].join(' ')}
      {...rest}
    >
      <SkeletonImage height="9rem" rounded="xl" className="rounded-b-none" />
      <div className="p-5">
        <SkeletonBox height="1rem" width="70%" className="mb-2.5" />
        <SkeletonText lines={2} lineHeight="0.625rem" gap="0.4rem" className="mb-4" />
        <div className="flex gap-2">
          <SkeletonBox height="1.375rem" width="4rem" className="rounded-full" />
          <SkeletonBox height="1.375rem" width="3.25rem" className="rounded-full" />
          <SkeletonBox height="1.375rem" width="4.5rem" className="rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Matches the layout of a stats overview card:
 * big number | label | secondary stat
 */
export function StatsCardSkeleton({
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={[
        'bg-white border border-neutral-200 rounded-xl p-5',
        className,
      ].join(' ')}
      {...rest}
    >
      <SkeletonBox height="0.625rem" width="40%" className="mb-3" />
      <SkeletonBox height="1.75rem" width="55%" className="mb-4" />
      <SkeletonBox height="0.5rem" width="70%" />
    </div>
  );
}
