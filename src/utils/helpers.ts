
export function sanitizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const sanitized = url.trim();
  // Basic check for common domains if no protocol present, or if it has protocol
  return sanitized.startsWith('http://') || 
         sanitized.startsWith('https://') || 
         sanitized.includes('.');
}

export function ensureProtocol(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function formatDateForSupabase(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  const brDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})/;
  const match = dateStr.match(brDateRegex);
  if (match) {
    const [_, day, month, year] = match;
    const parsed = new Date(`${year}-${month}-${day}T12:00:00.000Z`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}
