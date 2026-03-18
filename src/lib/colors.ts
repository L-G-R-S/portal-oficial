/**
 * Centralized entity colors and styling utilities
 * Eliminates duplicate color definitions across dashboard components
 */

export type EntityType = 'competitor' | 'prospect' | 'client' | 'primary';

// Social media platform colors (HSL values for charts and icons)
export const SOCIAL_COLORS = {
  linkedin: 'hsl(210, 100%, 50%)',
  instagram: 'hsl(340, 80%, 55%)',
  youtube: 'hsl(0, 100%, 50%)',
} as const;

// HSL color values for charts (used in recharts)
export const ENTITY_COLORS = {
  primary: 'hsl(25, 95%, 53%)',      // Orange - Your company
  competitor: 'hsl(210, 100%, 50%)', // Blue - Competitors
  prospect: 'hsl(45, 93%, 47%)',     // Yellow/Amber - Prospects
  client: 'hsl(142, 71%, 45%)',      // Green - Clients
} as const;

// Badge classes for entity type badges (Tailwind)
export const ENTITY_BADGE_CLASSES = {
  primary: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  competitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  prospect: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  client: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
} as const;

// Labels in Portuguese
export const ENTITY_LABELS = {
  primary: 'Sua Empresa',
  competitor: 'Concorrente',
  prospect: 'Prospect',
  client: 'Cliente',
} as const;

// Short labels for badges
export const ENTITY_SHORT_LABELS = {
  primary: 'P',
  competitor: 'C',
  prospect: 'Pr',
  client: 'Cl',
} as const;

/**
 * Get the color for an entity in charts
 */
export function getEntityColor(type: string, isPrimary = false): string {
  if (isPrimary) return ENTITY_COLORS.primary;
  
  switch (type) {
    case 'competitor':
      return ENTITY_COLORS.competitor;
    case 'prospect':
      return ENTITY_COLORS.prospect;
    case 'client':
      return ENTITY_COLORS.client;
    default:
      return ENTITY_COLORS.competitor;
  }
}

/**
 * Get badge CSS classes for an entity type
 */
export function getEntityBadgeClasses(type: string): string {
  switch (type) {
    case 'primary':
      return ENTITY_BADGE_CLASSES.primary;
    case 'competitor':
      return ENTITY_BADGE_CLASSES.competitor;
    case 'prospect':
      return ENTITY_BADGE_CLASSES.prospect;
    case 'client':
      return ENTITY_BADGE_CLASSES.client;
    default:
      return ENTITY_BADGE_CLASSES.competitor;
  }
}

/**
 * Get the label for an entity type
 */
export function getEntityLabel(type: string): string {
  return ENTITY_LABELS[type as EntityType] || type;
}

/**
 * Get the short label for an entity type (for badges)
 */
export function getEntityShortLabel(type: string): string {
  return ENTITY_SHORT_LABELS[type as EntityType] || type.charAt(0).toUpperCase();
}
