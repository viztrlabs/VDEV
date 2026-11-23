import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Mask a secret for display (show only the last 4 characters).
 * Framework-agnostic so it can be called from both server and client code. */
export function maskSecret(value: string): string {
  if (!value) return '';
  if (value.length <= 6) return '••••';
  return '••••' + value.slice(-4);
}
