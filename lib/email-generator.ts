import { UserRole } from '@prisma/client'
import { prisma } from './prisma'
import { SUPPORTED_CITIES, isSupportedCity } from './config/cities'

/**
 * Configuration for email generation
 */
interface EmailGeneratorConfig {
  supportedCities: readonly string[]
  roleEmailDomains: Record<UserRole, string>
}

/**
 * Result of email generation
 */
export interface GeneratedEmail {
  email: string
  city: string
  normalizedName: string
  registrationNumber: string
  role: UserRole
}

/**
 * Parsed email components
 */
export interface ParsedEmail {
  city: string
  name: string
  registrationNumber: string
  role: string
  domain: string
}

/**
 * Custom errors for email generation
 */
export class UnsupportedCityError extends Error {
  constructor(city: string, supportedCities: readonly string[]) {
    super(`City "${city}" is not supported. Supported cities: ${supportedCities.join(', ')}`)
    this.name = 'UnsupportedCityError'
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`Email "${email}" already exists`)
    this.name = 'DuplicateEmailError'
  }
}

/**
 * EmailGenerator service class
 * Handles generation and parsing of role-based email addresses
 */
class EmailGenerator {
  private config: EmailGeneratorConfig

  constructor() {
    this.config = {
      supportedCities: SUPPORTED_CITIES,
      roleEmailDomains: {
        CUSTOMER: 'customer.agrotrack.com',
        FARMER: 'farmer.agrotrack.com',
        ADMIN: 'admin.agrotrack.com',
        OPERATIONS: 'operations.agrotrack.com',
        DRIVER: 'driver.agrotrack.com',
      },
    }
  }

  /**
   * Normalize name by removing spaces and converting to lowercase
   */
  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters, keep only alphanumeric
  }

  /**
   * Get the next registration number for a city and role combination
   * Uses atomic database operations to prevent race conditions
   */
  async getNextRegistrationNumber(city: string, role: UserRole): Promise<string> {
    // Validate city
    if (!isSupportedCity(city)) {
      throw new UnsupportedCityError(city, this.config.supportedCities)
    }

    // Use upsert with atomic increment to ensure uniqueness
    const registry = await (prisma as any).emailRegistry.upsert({
      where: {
        city_role: {
          city: city.toLowerCase(),
          role,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        city: city.toLowerCase(),
        role,
        count: 1,
      },
    })

    // Format registration number with leading zeros (e.g., 001, 002, 010, 100)
    return registry.count.toString().padStart(3, '0')
  }

  /**
   * Generate a unique email address for a user
   * Format: {city}.{name}.{registrationNumber}@{role}.agrotrack.com
   */
  async generateEmail(
    name: string,
    city: string,
    role: UserRole
  ): Promise<GeneratedEmail> {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }

    if (!city || city.trim().length === 0) {
      throw new Error('City is required')
    }

    // Normalize inputs
    const normalizedCity = city.toLowerCase().trim()
    const normalizedName = this.normalizeName(name)

    // Validate city
    if (!isSupportedCity(normalizedCity)) {
      throw new UnsupportedCityError(normalizedCity, this.config.supportedCities)
    }

    // Get next registration number
    const registrationNumber = await this.getNextRegistrationNumber(
      normalizedCity,
      role
    )

    // Get role domain
    const domain = this.config.roleEmailDomains[role]

    // Construct email
    const email = `${normalizedCity}.${normalizedName}.${registrationNumber}@${domain}`

    return {
      email,
      city: normalizedCity,
      normalizedName,
      registrationNumber,
      role,
    }
  }

  /**
   * Parse an email address to extract its components
   * Returns null if the email format is invalid
   */
  parseEmail(email: string): ParsedEmail | null {
    try {
      // Expected format: {city}.{name}.{registrationNumber}@{role}.agrotrack.com
      const emailRegex = /^([a-z]+)\.([a-z0-9]+)\.(\d{3})@([a-z]+)\.agrotrack\.com$/i

      const match = email.toLowerCase().match(emailRegex)

      if (!match) {
        return null
      }

      const [, city, name, registrationNumber, role] = match

      return {
        city,
        name,
        registrationNumber,
        role,
        domain: `${role}.agrotrack.com`,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Validate email format
   */
  isValidEmailFormat(email: string): boolean {
    return this.parseEmail(email) !== null
  }

  /**
   * Get supported cities
   */
  getSupportedCities(): readonly string[] {
    return this.config.supportedCities
  }

  /**
   * Get role domain
   */
  getRoleDomain(role: UserRole): string {
    return this.config.roleEmailDomains[role]
  }
}

// Export singleton instance
export const emailGenerator = new EmailGenerator()

// Export class for testing
export { EmailGenerator }
