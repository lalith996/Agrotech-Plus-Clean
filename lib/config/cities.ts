/**
 * Supported Cities Configuration
 * 
 * This module defines the list of cities supported by the AgroTrack+ platform
 * for email generation and user registration.
 */

export const SUPPORTED_CITIES = [
  'bangalore',
  'mysore',
  'hubli',
  'mangalore',
  'belgaum',
  'gulbarga',
  'davangere',
  'bellary'
] as const;

/**
 * Type-safe city type derived from the supported cities list
 */
export type SupportedCity = typeof SUPPORTED_CITIES[number];

/**
 * Type guard to check if a string is a supported city
 * 
 * @param city - The city string to validate
 * @returns True if the city is in the supported cities list
 * 
 * @example
 * if (isSupportedCity('bangalore')) {
 *   // city is typed as SupportedCity
 * }
 */
export function isSupportedCity(city: string): city is SupportedCity {
  return SUPPORTED_CITIES.includes(city as SupportedCity);
}

/**
 * Validates and normalizes a city name
 * 
 * @param city - The city string to validate and normalize
 * @returns The normalized city name (lowercase, trimmed)
 * @throws Error if the city is not supported
 * 
 * @example
 * const city = validateCity('Bangalore'); // returns 'bangalore'
 */
export function validateCity(city: string): SupportedCity {
  const normalized = city.toLowerCase().trim();
  
  if (!isSupportedCity(normalized)) {
    throw new Error(
      `Unsupported city: ${city}. Supported cities are: ${SUPPORTED_CITIES.join(', ')}`
    );
  }
  
  return normalized;
}

/**
 * Gets a display-friendly version of the city name
 * 
 * @param city - The city to format
 * @returns The city name with proper capitalization
 * 
 * @example
 * getCityDisplayName('bangalore'); // returns 'Bangalore'
 */
export function getCityDisplayName(city: SupportedCity): string {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

// --- Extended operational configuration (non-breaking additions) ---

export interface CityConfig {
  code: string; // short code, e.g., BLR
  name: string; // display name, e.g., Bangalore
  slug: SupportedCity; // URL-safe identifier, e.g., bangalore
  isActive: boolean; // whether city is currently supported for operations
  deliveryZones?: string[]; // optional list of zone slugs for logistics/routing
}

export const SUPPORTED_CITY_CONFIGS: CityConfig[] = [
  { code: 'BLR', name: 'Bangalore', slug: 'bangalore', isActive: true, deliveryZones: ['central', 'east', 'west', 'north', 'south'] },
  { code: 'MYS', name: 'Mysore', slug: 'mysore', isActive: true, deliveryZones: ['central', 'north', 'south'] },
  { code: 'HUB', name: 'Hubli', slug: 'hubli', isActive: true },
  { code: 'MNG', name: 'Mangalore', slug: 'mangalore', isActive: true },
  { code: 'BEL', name: 'Belgaum', slug: 'belgaum', isActive: true },
  { code: 'GLB', name: 'Gulbarga', slug: 'gulbarga', isActive: false },
  { code: 'DVG', name: 'Davangere', slug: 'davangere', isActive: true },
  { code: 'BLL', name: 'Bellary', slug: 'bellary', isActive: true },
];

export const DEFAULT_CITY_CODE = 'BLR';

export function getActiveCities(): CityConfig[] {
  return SUPPORTED_CITY_CONFIGS.filter(c => c.isActive);
}

export function getCityByCode(code: string): CityConfig | undefined {
  const normalized = code?.trim().toUpperCase();
  return SUPPORTED_CITY_CONFIGS.find(c => c.code === normalized);
}

/**
 * Flexible support check for code/slug/name without changing the existing type guard.
 */
export function isCitySupported(input: string): boolean {
  const normalized = input?.trim().toLowerCase();
  return SUPPORTED_CITY_CONFIGS.some(
    c => c.slug === normalized || c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized,
  );
}
