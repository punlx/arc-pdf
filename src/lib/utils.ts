
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
