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
  generated: (userId: string) => ['recipes', 'generated', userId] as const,
  search:    (ingredients: string[]) => ['recipes', 'search', ...ingredients] as const,
};


// ---- Queries ----

/**
 * Generate recipe suggestions from a user's expiring items.
 *
 * Disabled by default — call `refetch()` to trigger on demand
 * since this hits the Gemini API and is rate-limited.
 */
export function useGenerateRecipes(userId: string) {
  return useQuery<Recipe[], Error>({
    queryKey: recipeKeys.generated(userId),
    queryFn: () => recipesApi.generate(userId),
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
  return useMutation<Recipe[], Error, string>({
    mutationFn: (userId) => recipesApi.generate(userId),
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
