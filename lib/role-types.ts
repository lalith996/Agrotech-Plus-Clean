/**
 * User Role Types
 * Extracted from Prisma schema for use in Edge runtime (middleware)
 */

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  FARMER = 'FARMER',
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS',
  DRIVER = 'DRIVER'
}

export type UserRoleType = UserRole | 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'OPERATIONS' | 'DRIVER'
