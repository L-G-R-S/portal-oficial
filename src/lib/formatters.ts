/**
 * Centralized formatting utilities
 * Eliminates duplicate formatNumber functions across components
 */

import { differenceInSeconds } from 'date-fns';

/**
 * Format large numbers into readable format (1.5M, 200K, etc.)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Format duration from start/end date strings
 */
export function formatDurationFromDates(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '-';
  const seconds = differenceInSeconds(new Date(completedAt), new Date(startedAt));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}



/**
 * Format date to Brazilian format
 */
export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return "data não informada";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
