import {
  useQuery,
  useMutation,
} from '@tanstack/react-query';
import { recipesApi } from '../api/endpoints/recipes';
import type { Recipe } from '../types';

/* ============================================
 * FridgeTrack — Recipe Hooks
 * ============================================
 * React Query hooks for AI recipe generation
 * and ingredient-based search.
 * ============================================ */


// ---- Query Keys ----

const recipeKeys = {
  generated: (items: string[]) => ['recipes', 'generated', ...items] as const,
  search:    (ingredients: string[]) => ['recipes', 'search', ...ingredients] as const,
};


// ---- Queries ----

/**
 * Generate recipe suggestions from explicit item names.
 *
 * Disabled by default — call `refetch()` to trigger on demand
 * since this hits the Gemini API and is rate-limited.
 */
export function useGenerateRecipes(items: string[]) {
  return useQuery<Recipe[], Error>({
    queryKey: recipeKeys.generated(items),
    queryFn: () => recipesApi.generate(items),
    enabled: false,
    staleTime: 10 * 60 * 1_000,
  });
}

/**
 * Search recipes by specific ingredients.
 *
 * Disabled by default — trigger via `refetch()`.
 * Uses a 10-minute stale time to avoid redundant Gemini calls.
 */
export function useSearchRecipes(ingredients: string[]) {
  return useQuery<Recipe[], Error>({
    queryKey: recipeKeys.search(ingredients),
    queryFn: () => recipesApi.getByIngredients(ingredients),
    enabled: false,
    staleTime: 10 * 60 * 1_000,
  });
}


// ---- Mutations ----

/**
 * Generate recipes as a mutation (fire-and-forget style).
 *
 * Use this when you want `mutate()` / `mutateAsync()` semantics
 * instead of the query-based `useGenerateRecipes` above.
 */
export function useGenerateRecipesMutation() {
  return useMutation<Recipe[], Error, string[]>({
    mutationFn: (items) => recipesApi.generate(items),
  });
}

/**
 * Search recipes by ingredients as a mutation.
 *
 * Useful for on-demand search triggered by a button press
 * rather than reactive query refetching.
 */
export function useSearchRecipesMutation() {
  return useMutation<Recipe[], Error, string[]>({
    mutationFn: (ingredients) => recipesApi.getByIngredients(ingredients),
  });
}
