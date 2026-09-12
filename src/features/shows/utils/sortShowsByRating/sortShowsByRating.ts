import type { Show } from '../../types';

export function sortShowsByRating(shows: Show[]): Show[] {
  return [...shows].sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0));
}
