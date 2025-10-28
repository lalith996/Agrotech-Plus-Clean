/**
 * Role-Based Access Control System
 * 
 * This module provides a centralized service for managing role-based permissions
 * across routes, API endpoints, and navigation items.
 */

import { UserRole } from '@prisma/client'

/**
 * Role permissions configuration
 */
interface RolePermissions {
  allowedRoutes: string[]
  allowedApiEndpoints: string[]
  dashboardPath: string
}

/**
 * Navigation item configuration
 */
export interface NavigationItem {
  label: string
  href: string
  icon: string
  roles: UserRole[]
}

/**
 * RoleAccessControl Service Class
 * 
 * Provides methods to check route access, API access, and retrieve
 * role-specific configuration.
 */
class RoleAccessControl {
  private rolePermissions: Record<UserRole, RolePermissions>

  constructor() {
    // Initialize role permissions based on design document
    this.rolePermissions = {
      CUSTOMER: {
        allowedRoutes: [
          '/',
          '/products',
          '/products/[id]',
          '/cart',
          '/checkout',
          '/orders',
          '/orders/[id]',
          '/subscriptions',
          '/subscriptions/create',
          '/subscriptions/index',
          '/profile',
          '/wishlist',
          '/dashboard',
          '/order-confirmation',
          '/about',
          '/contact',
          '/faq',
          '/customer/dashboard',
          '/customer/orders',
          '/customer/orders/[id]',
        ],
        allowedApiEndpoints: [
          '/api/products',
          '/api/products/*',
          '/api/orders',
          '/api/orders/*',
          '/api/subscriptions',
          '/api/subscriptions/*',
          '/api/customer/*',
          '/api/users/profile',
          '/api/chat',
          '/api/personalization/*',
          '/api/v1/recommendations/*',
          '/api/create-payment-intent',
          '/api/search/*',
        ],
        dashboardPath: '/dashboard',
      },

      FARMER: {
        allowedRoutes: [
          '/',
          '/farmer/dashboard',
          '/farmer/products',
          '/farmer/products/new',
          '/farmer/products/[id]',
          '/farmer/products/[id]/edit',
          '/farmer/products/index',
          '/farmer/orders',
          '/farmer/orders/[id]',
          '/farmer/deliveries',
          '/farmer/insights',
          '/farmer/profile',
          '/farmer/certifications',
          '/farmer/certifications/new',
          '/farmer/certifications/[id]',
          '/farmer/certifications/[id]/edit',
          '/farmer/certifications/index',
          '/profile',
          '/about',
          '/contact',
        ],
        allowedApiEndpoints: [
          '/api/farmer/*',
          '/api/products',
          '/api/products/*',
          '/api/certifications',
          '/api/certifications/*',
          '/api/files/*',
          '/api/upload/*',
          '/api/users/profile',
          '/api/orders',
          '/api/orders/*',
        ],
        dashboardPath: '/farmer/dashboard',
      },

      ADMIN: {
        allowedRoutes: [
          '/',
          '/admin/dashboard',
          '/admin/farmers',
          '/admin/farmers/[id]',
          '/admin/users',
          '/admin/users/[id]',
          '/admin/procurement',
          '/admin/procurement/[id]',
          '/admin/delivery-zones',
          '/admin/qc',
          '/admin/qc/[id]',
          '/admin/qc/index',
          '/admin/analytics',
          '/admin/settings',
          '/admin/files',
          '/admin/logistics',
          '/admin/logistics/drivers',
          '/admin/logistics/orders',
          '/admin/logistics/routes',
          '/admin/logistics/vehicles',
          '/profile',
        ],
        allowedApiEndpoints: [
          '/api/admin/*',
          '/api/farmers',
          '/api/farmers/*',
          '/api/users',
          '/api/users/*',
          '/api/products',
          '/api/products/*',
          '/api/orders',
          '/api/orders/*',
          '/api/subscriptions',
          '/api/subscriptions/*',
          '/api/delivery-zones',
          '/api/delivery-zones/*',
          '/api/qc/*',
          '/api/quality/*',
          '/api/v1/recommendations/*',
          '/api/files/*',
          '/api/search/*',
          '/api/notifications',
          '/api/notifications/*',
          '/api/certifications',
          '/api/certifications/*',
        ],
        dashboardPath: '/admin/dashboard',
      },

      OPERATIONS: {
        allowedRoutes: [
          '/',
          '/admin/dashboard',
          '/admin/procurement',
          '/admin/procurement/[id]',
          '/admin/delivery-zones',
          '/admin/qc',
          '/admin/qc/[id]',
          '/admin/qc/index',
          '/admin/logistics',
          '/admin/logistics/drivers',
          '/admin/logistics/orders',
          '/admin/logistics/routes',
          '/admin/logistics/vehicles',
          '/admin/analytics',
          '/profile',
        ],
        allowedApiEndpoints: [
          '/api/admin/procurement/*',
          '/api/admin/logistics/*',
          '/api/admin/qc/*',
          '/api/admin/analytics',
          '/api/admin/analytics/*',
          '/api/delivery-zones',
          '/api/delivery-zones/*',
          '/api/qc/*',
          '/api/quality/*',
          '/api/v1/recommendations/*',
          '/api/orders',
          '/api/orders/*',
          '/api/search/*',
          '/api/products',
          '/api/products/*',
        ],
        dashboardPath: '/admin/dashboard',
      },

      DRIVER: {
        allowedRoutes: [
          '/',
          '/driver/dashboard',
          '/driver/deliveries',
          '/driver/deliveries/[id]',
          '/driver/route',
          '/driver/earnings',
          '/profile',
        ],
        allowedApiEndpoints: [
          '/api/driver/*',
          '/api/orders',
          '/api/orders/*',
          '/api/delivery-zones',
          '/api/delivery-zones/*',
        ],
        dashboardPath: '/driver/dashboard',
      },
    }
  }

  /**
   * Check if a role can access a specific route
   * 
   * @param role - User role
   * @param path - Route path to check
   * @returns true if role has access, false otherwise
   */
  canAccessRoute(role: UserRole, path: string): boolean {
    const permissions = this.rolePermissions[role]
    if (!permissions) return false

    const { allowedRoutes } = permissions

    // Check exact match
    if (allowedRoutes.includes(path)) return true

    // Check dynamic route patterns (e.g., /products/[id])
    return allowedRoutes.some(allowedRoute => {
      if (allowedRoute.includes('[')) {
        // Convert [id] to regex pattern
        const pattern = allowedRoute.replace(/\[.*?\]/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(path)
      }
      return false
    })
  }

  /**
   * Check if a role can access a specific API endpoint
   * 
   * @param role - User role
   * @param endpoint - API endpoint to check
   * @returns true if role has access, false otherwise
   */
  canAccessApi(role: UserRole, endpoint: string): boolean {
    const permissions = this.rolePermissions[role]
    if (!permissions) return false

    const { allowedApiEndpoints } = permissions

    return allowedApiEndpoints.some(allowedEndpoint => {
      // Handle wildcard patterns (e.g., /api/admin/*)
      if (allowedEndpoint.endsWith('/*')) {
        const prefix = allowedEndpoint.slice(0, -2)
        return endpoint.startsWith(prefix)
      }
      
      // Handle dynamic route patterns (e.g., /api/orders/[id])
      if (allowedEndpoint.includes('[')) {
        const pattern = allowedEndpoint.replace(/\[.*?\]/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(endpoint)
      }
      
      // Exact match
      return endpoint === allowedEndpoint
    })
  }

  /**
   * Get the dashboard path for a specific role
   * 
   * @param role - User role
   * @returns Dashboard path for the role
   */
  getDashboardPath(role: UserRole): string {
    return this.rolePermissions[role]?.dashboardPath || '/'
  }

  /**
   * Get navigation items filtered by role
   * 
   * @param role - User role
   * @returns Array of navigation items for the role
   */
  getNavigationItems(role: UserRole): NavigationItem[] {
    // Filter all navigation items by role
    return navigationConfig.filter(item => item.roles.includes(role))
  }
}

/**
 * Navigation configuration with role-based visibility
 */
const navigationConfig: NavigationItem[] = [
  // Customer navigation
  { label: 'Home', href: '/', icon: 'Home', roles: ['CUSTOMER'] },
  { label: 'Products', href: '/products', icon: 'ShoppingBag', roles: ['CUSTOMER'] },
  { label: 'My Orders', href: '/orders', icon: 'Package', roles: ['CUSTOMER'] },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'RefreshCcw', roles: ['CUSTOMER'] },
  { label: 'Wishlist', href: '/wishlist', icon: 'Heart', roles: ['CUSTOMER'] },
  { label: 'Profile', href: '/profile', icon: 'User', roles: ['CUSTOMER'] },

  // Farmer navigation
  { label: 'Dashboard', href: '/farmer/dashboard', icon: 'LayoutDashboard', roles: ['FARMER'] },
  { label: 'My Products', href: '/farmer/products', icon: 'Package', roles: ['FARMER'] },
  { label: 'Deliveries', href: '/farmer/deliveries', icon: 'Truck', roles: ['FARMER'] },
  { label: 'Insights', href: '/farmer/insights', icon: 'BarChart3', roles: ['FARMER'] },
  { label: 'Certifications', href: '/farmer/certifications', icon: 'Award', roles: ['FARMER'] },
  { label: 'Profile', href: '/farmer/profile', icon: 'User', roles: ['FARMER'] },

  // Admin navigation
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', roles: ['ADMIN'] },
  { label: 'Farmers', href: '/admin/farmers', icon: 'Users', roles: ['ADMIN'] },
  { label: 'Users', href: '/admin/users', icon: 'UserCog', roles: ['ADMIN'] },
  { label: 'Procurement', href: '/admin/procurement', icon: 'ClipboardList', roles: ['ADMIN'] },
  { label: 'Delivery Zones', href: '/admin/delivery-zones', icon: 'MapPin', roles: ['ADMIN'] },
  { label: 'Quality Control', href: '/admin/qc', icon: 'CheckCircle', roles: ['ADMIN'] },
  { label: 'Logistics', href: '/admin/logistics', icon: 'Truck', roles: ['ADMIN'] },
  { label: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp', roles: ['ADMIN'] },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings', roles: ['ADMIN'] },

  // Operations navigation
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', roles: ['OPERATIONS'] },
  { label: 'Procurement', href: '/admin/procurement', icon: 'ClipboardList', roles: ['OPERATIONS'] },
  { label: 'Logistics', href: '/admin/logistics', icon: 'Truck', roles: ['OPERATIONS'] },
  { label: 'Quality Control', href: '/admin/qc', icon: 'CheckCircle', roles: ['OPERATIONS'] },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', roles: ['OPERATIONS'] },

  // Driver navigation
  { label: 'Dashboard', href: '/driver/dashboard', icon: 'LayoutDashboard', roles: ['DRIVER'] },
  { label: 'My Deliveries', href: '/driver/deliveries', icon: 'Package', roles: ['DRIVER'] },
  { label: 'Route', href: '/driver/route', icon: 'Map', roles: ['DRIVER'] },
  { label: 'Earnings', href: '/driver/earnings', icon: 'DollarSign', roles: ['DRIVER'] },
  { label: 'Profile', href: '/profile', icon: 'User', roles: ['DRIVER'] },
]

// Export singleton instance
export const roleAccessControl = new RoleAccessControl()

// Export navigation configuration
export { navigationConfig }
