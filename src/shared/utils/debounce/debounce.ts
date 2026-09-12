import type { DebouncedFunction } from '../types';

export function debounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  let timeoutId: number | undefined;

  const debounced = (...args: Parameters<T>) => {
    window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };

  debounced.cancel = () => {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced;
}
