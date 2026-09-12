import { describe, expect, it } from 'vitest';

import { groupShowsByGenre } from './groupShowsByGenre';
import type { Show } from '../../types';

function createShow(id: number, name: string, genres: string[], rating: number | null): Show {
  return {
    id,
    name,
    genres,
    rating: {
      average: rating,
    },
  } as Show;
}

describe('groupShowsByGenre', () => {
  it('groups shows by genre', () => {
    const shows = [
      createShow(1, 'Show A', ['Drama', 'Action'], 8),
      createShow(2, 'Show B', ['Drama'], 9),
    ];

    const result = groupShowsByGenre(shows);

    const drama = result.find((group) => group.name === 'Drama');
    const action = result.find((group) => group.name === 'Action');

    expect(drama?.shows).toHaveLength(2);
    expect(action?.shows).toHaveLength(1);
  });

  it('sorts shows by rating in descending order', () => {
    const shows = [
      createShow(1, 'Lower rated', ['Drama'], 7),
      createShow(2, 'Higher rated', ['Drama'], 9),
    ];

    const result = groupShowsByGenre(shows);
    const drama = result.find((group) => group.name === 'Drama');

    expect(drama?.shows.map((show) => show.name)).toEqual(['Higher rated', 'Lower rated']);
  });

  it('places shows without a rating after rated shows', () => {
    const shows = [
      createShow(1, 'No rating', ['Drama'], null),
      createShow(2, 'Rated show', ['Drama'], 8),
    ];

    const result = groupShowsByGenre(shows);
    const drama = result.find((group) => group.name === 'Drama');

    expect(drama?.shows.map((show) => show.name)).toEqual(['Rated show', 'No rating']);
  });

  it('adds a show to each of its genres', () => {
    const shows = [createShow(1, 'Show A', ['Drama', 'Action', 'Thriller'], 8)];

    const result = groupShowsByGenre(shows);

    expect(result.map((group) => group.name)).toEqual(['Drama', 'Action', 'Thriller']);
  });

  it('returns an empty array when there are no shows', () => {
    expect(groupShowsByGenre([])).toEqual([]);
  });
});
