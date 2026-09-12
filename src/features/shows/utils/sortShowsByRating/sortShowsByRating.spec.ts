import { describe, expect, it } from 'vitest';

import type { Show } from '../../types';
import { sortShowsByRating } from './sortShowsByRating';

function createShow(id: number, rating: number | null): Show {
  return {
    id,
    rating: { average: rating },
  } as Show;
}

describe('sortShowsByRating', () => {
  it('sorts shows by rating in descending order', () => {
    const shows = [createShow(1, 7.5), createShow(2, 9.2), createShow(3, 8.4)];

    const result = sortShowsByRating(shows);

    expect(result.map((show) => show.id)).toEqual([2, 3, 1]);
  });

  it('places shows without a rating after rated shows', () => {
    const shows = [createShow(1, null), createShow(2, 8.5)];

    const result = sortShowsByRating(shows);

    expect(result.map((show) => show.id)).toEqual([2, 1]);
  });

  it('does not mutate the original array', () => {
    const shows = [createShow(1, 7), createShow(2, 9)];

    sortShowsByRating(shows);

    expect(shows.map((show) => show.id)).toEqual([1, 2]);
  });
});
