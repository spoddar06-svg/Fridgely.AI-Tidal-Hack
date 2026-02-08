import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe, RecipeDifficulty, InventoryItem } from '../types';
import { useInventory } from '../hooks/useInventory';
import { recipesApi } from '../api/endpoints/recipes';
import RecipeCard from '../components/features/Recipes/RecipeCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';

/* ---- Types ---- */

type PageStatus = 'empty' | 'loading' | 'loaded' | 'error';
type DifficultyFilter = RecipeDifficulty | 'all';

const USER_ID = 'demo_user';

/* ---- Icons ---- */

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"
        fill="currentColor"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 4v6h-6M1 20v-6h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Skeleton card ---- */

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-slate-950/60 backdrop-blur-2xl p-5 animate-pulse">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-3/5 rounded bg-neutral-200" />
        <div className="h-5 w-14 rounded-full bg-neutral-200" />
      </div>
      {/* Description */}
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded bg-neutral-100" />
        <div className="h-3.5 w-4/5 rounded bg-neutral-100" />
      </div>
      {/* Metadata */}
      <div className="mt-4 flex gap-4">
        <div className="h-4 w-16 rounded bg-neutral-100" />
        <div className="h-4 w-20 rounded bg-neutral-100" />
      </div>
      {/* Ingredients */}
      <div className="mt-5 space-y-2.5">
        <div className="h-3 w-20 rounded bg-neutral-200" />
        <div className="h-3.5 w-full rounded bg-neutral-100" />
        <div className="h-3.5 w-5/6 rounded bg-neutral-100" />
        <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
      </div>
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex gap-3">
        <div className="h-8 w-24 rounded-lg bg-neutral-200" />
        <div className="h-8 w-20 rounded-lg bg-neutral-200" />
      </div>
    </div>
  );
}

/* ---- Toast ---- */

interface ToastState {
  visible: boolean;
  recipeName: string;
}

function Toast({
  recipeName,
  onClose,
}: {
  recipeName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={[
        'fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2.5 px-5 py-3',
        'rounded-xl bg-neutral-900 text-white',
        'shadow-strong',
        'animate-[slideUp_300ms_ease-out]',
      ].join(' ')}
      role="status"
    >
      <span className="text-success-light shrink-0">
        <CheckIcon />
      </span>
      <span className="text-sm font-medium">
        Marked &ldquo;{recipeName}&rdquo; as cooked!
      </span>
    </div>
  );
}

/* ---- Helpers ---- */

const EXPIRING_DAYS = 3;

function getDaysUntil(date: string): number {
  if (!date) return Infinity;
  const exp = new Date(date);
  if (Number.isNaN(exp.getTime())) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Extract unique item names, prioritizing items expiring within EXPIRING_DAYS */
function getItemNames(items: InventoryItem[]): { expiring: string[]; all: string[] } {
  const expiringSet = new Set<string>();
  const allSet = new Set<string>();

  for (const item of items) {
    const name = item.item_name.toLowerCase().trim();
    if (!name) continue;
    allSet.add(name);
    if (getDaysUntil(item.expiration_date) <= EXPIRING_DAYS) {
      expiringSet.add(name);
    }
  }

  return { expiring: [...expiringSet], all: [...allSet] };
}

/* ---- Component ---- */

export default function RecipesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>('empty');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    recipeName: '',
  });

  // Filters
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  // Inventory data
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useInventory(USER_ID);

  const itemNames = useMemo(() => getItemNames(inventoryItems), [inventoryItems]);

  /* ---- Generate recipes ---- */

  const handleGenerate = useCallback(async () => {
    setStatus('loading');
    setError('');
    let result: Recipe[] = [];
    let failed = false;

    try {
      if (itemNames.all.length === 0) {
        throw new Error('Your fridge is empty! Scan some food first.');
      }

      // Send all items — expiring items listed first so Gemini prioritizes them
      const expiringSet = new Set(itemNames.expiring);
      const nonExpiring = itemNames.all.filter((n) => !expiringSet.has(n));
      const names = [...itemNames.expiring, ...nonExpiring];

      result = await recipesApi.generate(names);
    } catch (err) {
      failed = true;
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setRecipes(result);
      setStatus(failed ? 'error' : 'loaded');
    }
  }, [itemNames]);

  /* ---- Cook handler ---- */

  const handleCook = useCallback((recipe: Recipe) => {
    setToast({ visible: true, recipeName: recipe.name });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  /* ---- Filtered recipes (memoized) ---- */

  const filtered = useMemo(
    () =>
      recipes.filter((r) => {
        if (expiringOnly && r.uses_expiring_items.length === 0) return false;
        if (difficulty !== 'all' && r.difficulty !== difficulty) return false;
        return true;
      }),
    [recipes, expiringOnly, difficulty],
  );

  const showFilters = status === 'loaded' && recipes.length > 0;

  /* ---- Render ---- */

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* ── Header ── */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Recipes to Save Your Food
          </h1>
          <p className="mt-1 text-sky-100">
            AI-generated meals using what&apos;s already in your fridge.
          </p>
        </div>
        {/* Desktop generate button */}
        <Button
          variant="primary"
          size="md"
          leftIcon={<SparkleIcon />}
          isLoading={status === 'loading'}
          disabled={inventoryLoading || itemNames.all.length === 0}
          onClick={handleGenerate}
          className="hidden md:inline-flex"
        >
          {recipes.length > 0 ? 'Refresh Recipes' : 'Get New Recipes'}
        </Button>
      </section>

      {/* ── Filters ── */}
      {showFilters && (
        <section
          className={[
            'flex flex-col md:flex-row md:items-center gap-4',
            'rounded-xl border border-neutral-200 bg-slate-950/60 backdrop-blur-2xl',
            'p-4',
          ].join(' ')}
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <FilterIcon />
            <span className="text-sm font-medium text-white">
              Filters
            </span>
          </div>

          {/* Expiring toggle */}
          <label
            className={[
              'inline-flex items-center gap-2.5 cursor-pointer',
              'select-none',
            ].join(' ')}
          >
            <button
              type="button"
              role="switch"
              aria-checked={expiringOnly}
              onClick={() => setExpiringOnly((prev) => !prev)}
              className={[
                'relative inline-flex h-6 w-11 shrink-0',
                'rounded-full border-2 border-transparent',
                'transition-colors duration-200 ease-in-out',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
                'cursor-pointer',
                expiringOnly ? 'bg-brand-600' : 'bg-neutral-300',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none inline-block h-5 w-5',
                  'rounded-full bg-slate-950/60 backdrop-blur-2xl shadow-sm',
                  'transform transition-transform duration-200 ease-in-out',
                  expiringOnly ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
            <span className="text-sm text-white">
              Only recipes using expiring items
            </span>
          </label>

          {/* Difficulty dropdown */}
          <div className="flex items-center gap-2 md:ml-auto">
            <span className="text-sm text-slate-200">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as DifficultyFilter)
              }
              className={[
                'rounded-lg border border-neutral-200 bg-slate-950/60 backdrop-blur-2xl',
                'px-3 py-1.5 text-sm text-white',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
                'cursor-pointer',
              ].join(' ')}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </section>
      )}

      {/* ── Result count ── */}
      {showFilters && (
        <p className="text-sm text-slate-200">
          Showing{' '}
          <span className="font-semibold text-white">
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'recipe' : 'recipes'}
          {(expiringOnly || difficulty !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setExpiringOnly(false);
                setDifficulty('all');
              }}
              className="ml-2 text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* ── Inventory info ── */}
      {!inventoryLoading && status === 'empty' && itemNames.all.length > 0 && (
        <p className="text-sm text-slate-200">
          {itemNames.expiring.length > 0
            ? `${itemNames.expiring.length} item${itemNames.expiring.length === 1 ? '' : 's'} expiring soon — recipes will prioritize these.`
            : `${itemNames.all.length} item${itemNames.all.length === 1 ? '' : 's'} in your fridge.`}
        </p>
      )}

      {/* ── Content ── */}

      {/* Empty state — no inventory at all */}
      {status === 'empty' && !inventoryLoading && itemNames.all.length === 0 && (
        <EmptyState
          icon={<CameraIcon />}
          title="Your fridge is empty!"
          description="Scan some food first so we can generate recipes from your ingredients."
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<CameraIcon />}
              onClick={() => navigate('/scan')}
            >
              Scan Your Fridge
            </Button>
          }
        />
      )}

      {/* Empty state — has inventory, ready to generate */}
      {status === 'empty' && !inventoryLoading && itemNames.all.length > 0 && (
        <EmptyState
          icon={<BookOpenIcon />}
          title="No recipes yet"
          description='Click "Get New Recipes" to generate meal ideas from your scanned items.'
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<SparkleIcon />}
              onClick={handleGenerate}
            >
              Get New Recipes
            </Button>
          }
        />
      )}

      {/* Loading skeletons */}
      {status === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="max-w-lg mx-auto space-y-4">
          <Alert variant="danger" title="Recipe generation failed">
            {error}
          </Alert>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshIcon />}
              onClick={handleGenerate}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loaded — recipe grid */}
      {status === 'loaded' && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelectRecipe={handleCook}
            />
          ))}
        </div>
      )}

      {/* Loaded — no recipes returned from API */}
      {status === 'loaded' && recipes.length === 0 && (
        <EmptyState
          icon={<BookOpenIcon />}
          title="Your fridge is empty!"
          description="Scan some food to get recipes. We'll generate meal ideas based on what's in your fridge."
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<CameraIcon />}
              onClick={() => navigate('/scan')}
            >
              Scan Your Fridge
            </Button>
          }
        />
      )}

      {/* Loaded — no matches after filtering */}
      {status === 'loaded' && filtered.length === 0 && recipes.length > 0 && (
        <EmptyState
          icon={<FilterIcon />}
          title="No matching recipes"
          description="Try adjusting your filters to see more results."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExpiringOnly(false);
                setDifficulty('all');
              }}
            >
              Clear Filters
            </Button>
          }
        />
      )}

      {/* ── Fixed bottom generate button — mobile only ── */}
      <div
        className={[
          'fixed bottom-16 inset-x-0 z-30',
          'px-4 pb-3 pt-4',
          'bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-transparent',
          'md:hidden',
        ].join(' ')}
      >
        <Button
          variant="primary"
          size="lg"
          leftIcon={<SparkleIcon />}
          isLoading={status === 'loading'}
          disabled={inventoryLoading || itemNames.all.length === 0}
          onClick={handleGenerate}
          fullWidth
          className="min-h-[44px] shadow-medium"
        >
          {recipes.length > 0 ? 'Refresh Recipes' : 'Get New Recipes'}
        </Button>
      </div>

      {/* ── Toast ── */}
      {toast.visible && (
        <Toast recipeName={toast.recipeName} onClose={dismissToast} />
      )}
    </div>
  );
}
