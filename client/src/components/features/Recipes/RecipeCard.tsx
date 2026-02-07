import { useState } from 'react';
import type { Recipe, RecipeDifficulty } from '../../../types';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

/* ---- Style map ---- */

const difficultyBadge: Record<RecipeDifficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

/* ---- Icons (inline SVGs) ---- */

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ServingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4 12 14.01l-3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={[
        'transition-transform duration-300',
        expanded ? 'rotate-180' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Component ---- */

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  onSelectRecipe,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const expiringCount = recipe.uses_expiring_items.length;

  return (
    <Card variant="default" padding="none" className="hover:shadow-medium">
      {/* ── Header ── */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
            {recipe.name}
          </h3>
          {recipe.difficulty && (
            <Badge
              variant={difficultyBadge[recipe.difficulty]}
              size="sm"
            >
              {recipe.difficulty.charAt(0).toUpperCase() +
                recipe.difficulty.slice(1)}
            </Badge>
          )}
        </div>
        {recipe.description && (
          <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">
            {recipe.description}
          </p>
        )}
      </div>

      {/* ── Metadata ── */}
      <div className="flex items-center gap-4 px-5 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
          <ClockIcon />
          {recipe.prep_time_minutes} min
        </span>
        {recipe.servings != null && (
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
            <ServingsIcon />
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </span>
        )}
      </div>

      {/* ── Expiring items callout ── */}
      {expiringCount > 0 && (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-success-light px-3 py-2.5">
          <span className="text-success-dark shrink-0">
            <SparkleIcon />
          </span>
          <span className="text-sm font-medium text-success-dark">
            Uses {expiringCount} expiring{' '}
            {expiringCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* ── Ingredients ── */}
      <div className="px-5 pt-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2.5">
          Ingredients
        </h4>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={i}
              className={[
                'flex items-center gap-2.5',
                !ing.in_inventory && 'opacity-50',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={
                  ing.in_inventory
                    ? 'text-brand-600 shrink-0'
                    : 'text-neutral-300 shrink-0'
                }
              >
                {ing.in_inventory ? (
                  <CheckCircleIcon />
                ) : (
                  <EmptyCircleIcon />
                )}
              </span>
              <span className="text-sm text-neutral-700">
                {ing.amount}
                {ing.unit ? ` ${ing.unit}` : ''}{' '}
                <span className="font-medium">{ing.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Expandable instructions ── */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">
              Instructions
            </h4>
            <ol className="space-y-3">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className={[
          'flex items-center gap-3 px-5 py-4 mt-4',
          'border-t border-neutral-200 bg-neutral-50',
          'rounded-b-xl',
          onSelectRecipe ? 'justify-between' : 'justify-start',
        ].join(' ')}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          rightIcon={<ChevronIcon expanded={expanded} />}
        >
          {expanded ? 'Hide Steps' : 'View Recipe'}
        </Button>
        {onSelectRecipe && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectRecipe(recipe)}
          >
            Cook This
          </Button>
        )}
      </div>
    </Card>
  );
}
