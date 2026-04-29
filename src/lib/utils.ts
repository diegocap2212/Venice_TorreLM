import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a UTC timestamp (as stored in PostgreSQL) into a local Date
 * with the same calendar date, preventing off-by-one-day errors in UTC-N timezones.
 * Use this whenever displaying or formatting date-only fields (nascimento, admissão, etc.)
 */
export function parseUTCDate(date: Date | string): Date {
  const d = new Date(date)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}
