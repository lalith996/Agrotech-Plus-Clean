/**
 * Role Configuration Module
 * 
 * This module defines configuration for all user roles in the AgroTrack+ platform,
 * including display names, colors, and dashboard paths.
 */

import { UserRole } from '@prisma/client';

/**
 * Configuration for each user role
 */
export interface RoleConfig {
  displayName: string;
  color: string;
  dashboardPath: string;
  emailDomain: string;
}

/**
 * Complete role configuration mapping
 * 
 * Each role has:
 * - displayName: Human-readable name for UI display
 * - color: Tailwind color class for badges and UI elements
 * - dashboardPath: Default landing page after login
 * - emailDomain: Domain suffix for generated emails
 */
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  CUSTOMER: {
    displayName: 'Customer',
    color: 'blue',
    dashboardPath: '/dashboard',
    emailDomain: 'customer.agrotrack.com'
  },
  FARMER: {
    displayName: 'Farmer',
    color: 'green',
    dashboardPath: '/farmer/dashboard',
    emailDomain: 'farmer.agrotrack.com'
  },
  ADMIN: {
    displayName: 'Admin',
    color: 'purple',
    dashboardPath: '/admin/dashboard',
    emailDomain: 'admin.agrotrack.com'
  },
  OPERATIONS: {
    displayName: 'Operations',
    color: 'orange',
    dashboardPath: '/admin/dashboard',
    emailDomain: 'operations.agrotrack.com'
  },
  DRIVER: {
    displayName: 'Driver',
    color: 'teal',
    dashboardPath: '/driver/dashboard',
    emailDomain: 'driver.agrotrack.com'
  }
};

/**
 * Gets the configuration for a specific role
 * 
 * @param role - The user role
 * @returns The role configuration
 * 
 * @example
 * const config = getRoleConfig('CUSTOMER');
 * console.log(config.displayName); // 'Customer'
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIG[role];
}

/**
 * Gets the dashboard path for a specific role
 * 
 * @param role - The user role
 * @returns The dashboard path
 * 
 * @example
 * const path = getDashboardPath('FARMER'); // '/farmer/dashboard'
 */
export function getDashboardPath(role: UserRole): string {
  return ROLE_CONFIG[role].dashboardPath;
}

/**
 * Gets the display name for a specific role
 * 
 * @param role - The user role
 * @returns The display name
 * 
 * @example
 * const name = getRoleDisplayName('ADMIN'); // 'Admin'
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_CONFIG[role].displayName;
}

/**
 * Gets the color for a specific role (for badges and UI elements)
 * 
 * @param role - The user role
 * @returns The color class
 * 
 * @example
 * const color = getRoleColor('OPERATIONS'); // 'orange'
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_CONFIG[role].color;
}

/**
 * Gets the email domain for a specific role
 * 
 * @param role - The user role
 * @returns The email domain
 * 
 * @example
 * const domain = getRoleEmailDomain('DRIVER'); // 'driver.agrotrack.com'
 */
export function getRoleEmailDomain(role: UserRole): string {
  return ROLE_CONFIG[role].emailDomain;
}

/**
 * Tailwind color classes for role badges
 * Maps role colors to actual Tailwind classes
 */
export const ROLE_COLOR_CLASSES: Record<string, {
  bg: string;
  text: string;
  border: string;
}> = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300'
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-300'
  }
};

/**
 * Gets Tailwind classes for a role badge
 * 
 * @param role - The user role
 * @returns Object with bg, text, and border classes
 * 
 * @example
 * const classes = getRoleBadgeClasses('FARMER');
 * // { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
 */
export function getRoleBadgeClasses(role: UserRole): {
  bg: string;
  text: string;
  border: string;
} {
  const color = getRoleColor(role);
  return ROLE_COLOR_CLASSES[color];
}

// --- Extended operational policy configuration (non-breaking additions) ---

export type AuthProvider = 'credentials' | 'google';

export interface RoleSetting {
  label: string;
  dashboardPath: string;
  canSelfRegister: boolean;
  requiresCity: boolean;
  requiresRegistrationNumber: boolean;
  allowedAuthProviders: AuthProvider[];
}

export const ROLE_SETTINGS: Record<UserRole, RoleSetting> = {
  CUSTOMER: {
    label: 'Customer',
    dashboardPath: '/dashboard',
    canSelfRegister: true,
    requiresCity: false,
    requiresRegistrationNumber: false,
    allowedAuthProviders: ['credentials', 'google'],
  },
  FARMER: {
    label: 'Farmer',
    dashboardPath: '/farmer/dashboard',
    canSelfRegister: true,
    requiresCity: true,
    requiresRegistrationNumber: true,
    allowedAuthProviders: ['credentials'],
  },
  ADMIN: {
    label: 'Admin',
    dashboardPath: '/admin/dashboard',
    canSelfRegister: false,
    requiresCity: true,
    requiresRegistrationNumber: true,
    allowedAuthProviders: ['credentials'],
  },
  OPERATIONS: {
    label: 'Operations',
    dashboardPath: '/admin/dashboard',
    canSelfRegister: false,
    requiresCity: true,
    requiresRegistrationNumber: true,
    allowedAuthProviders: ['credentials'],
  },
  DRIVER: {
    label: 'Driver',
    dashboardPath: '/driver/dashboard',
    canSelfRegister: false,
    requiresCity: true,
    requiresRegistrationNumber: true,
    allowedAuthProviders: ['credentials'],
  },
};

export function getRoleSetting(role: UserRole): RoleSetting {
  return ROLE_SETTINGS[role];
}
