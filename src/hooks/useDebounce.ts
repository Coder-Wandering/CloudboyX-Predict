import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value (e.g. search filter input).
 * Ensures filtering calculations and UI re-renders only trigger after the user pauses typing.
 *
 * @param value The value to debounce
 * @param delay Milliseconds delay before committing the debounced value (default: 250ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
