export function coerceNumber(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null;
  const x = Number(String(n).replace(/[^\d.-]/g, ''));
  return Number.isFinite(x) ? x : null;
}

export function sanitizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}
