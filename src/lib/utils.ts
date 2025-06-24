// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes duplicate objects from an array based on a specific key.
 * @param array The array to deduplicate.
 * @param key The key to check for uniqueness.
 * @param transform An optional function to transform the key's value before comparison (e.g., value => value.toLowerCase()).
 * @returns A new array with duplicate objects removed.
 */
export function deduplicateByKey<T>(
  array: T[],
  key: keyof T,
  transform: (value: any) => any = (v) => v
): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = transform(item[key]);
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
