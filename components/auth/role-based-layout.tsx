/**
 * RoleBasedLayout Component
 * 
 * Provides role-based access control at the component level.
 * Checks user authentication and role permissions before rendering children.
 * Redirects unauthorized users to appropriate pages.
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { roleAccessControl } from '@/lib/role-access-control'
import { Loader2 } from 'lucide-react'

interface RoleBasedLayoutProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
  fallbackPath?: string
}

/**
 * RoleBasedLayout Component
 * 
 * Wraps page content and enforces role-based access control.
 * 
 * @param children - Content to render if authorized
 * @param allowedRoles - Array of roles that can access this content
 * @param requireAuth - Whether authentication is required (default: true)
 * @param fallbackPath - Custom redirect path for unauthorized access
 * 
 * @example
 * <RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
 *   <AdminContent />
 * </RoleBasedLayout>
 */
export function RoleBasedLayout({
  children,
  allowedRoles,
  requireAuth = true,
  fallbackPath,
}: RoleBasedLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return

    // Check authentication requirement
    if (requireAuth && !session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`)
      return
    }

    // Check role-based access if user is authenticated
    if (session?.user?.role) {
      const userRole = session.user.role as UserRole
      const currentPath = router.pathname

      // Check if user's role has access to current route
      if (!roleAccessControl.canAccessRoute(userRole, currentPath)) {
        // Redirect to role-specific dashboard
        const dashboardPath = fallbackPath || roleAccessControl.getDashboardPath(userRole)
        router.push(dashboardPath)
        return
      }

      // Check if specific roles are required for this component
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to role-specific dashboard
        const dashboardPath = fallbackPath || roleAccessControl.getDashboardPath(userRole)
        router.push(dashboardPath)
        return
      }
    }
  }, [session, status, router, allowedRoles, requireAuth, fallbackPath])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00B207] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting (unauthenticated)
  if (requireAuth && !session) {
    return null
  }

  // Show nothing while redirecting (unauthorized role)
  if (session?.user?.role) {
    const userRole = session.user.role as UserRole
    const currentPath = router.pathname

    // Check route access
    if (!roleAccessControl.canAccessRoute(userRole, currentPath)) {
      return null
    }

    // Check allowed roles
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return null
    }
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Higher-Order Component for page-level protection
 * 
 * Wraps a page component with RoleBasedLayout for easy role-based access control.
 * 
 * @param Component - Page component to protect
 * @param allowedRoles - Array of roles that can access this page
 * 
 * @example
 * export default withRoleAccess(AdminDashboard, ['ADMIN', 'OPERATIONS'])
 */
export function withRoleAccess(
  Component: React.ComponentType<any>,
  allowedRoles?: UserRole[]
) {
  return function ProtectedComponent(props: any) {
    return (
      <RoleBasedLayout allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleBasedLayout>
    )
  }
}
