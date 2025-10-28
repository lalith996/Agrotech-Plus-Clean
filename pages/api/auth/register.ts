import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { emailGenerator } from '@/lib/email-generator'
import { SUPPORTED_CITIES, validateCity, isCitySupported } from '@/lib/config/cities'
import { z } from 'zod'
import { getRoleSetting } from '@/lib/config/roles'

// Registration schema with conditional validation based on role
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  
  // Conditional fields based on role
  email: z.string().email('Invalid email format').optional(), // For CUSTOMER role
  city: z.enum(SUPPORTED_CITIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: `City must be one of: ${SUPPORTED_CITIES.join(', ')}` })
  }).optional(), // For non-CUSTOMER roles
  
  // Role-specific fields
  farmName: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().optional(),
}).refine((data) => {
  // CUSTOMER must provide email
  if (data.role === 'CUSTOMER' && !data.email) {
    return false
  }
  // Other roles must provide city
  if (data.role !== 'CUSTOMER' && !data.city) {
    return false
  }
  return true
}, {
  message: 'Email is required for customers, city is required for other roles',
  path: ['email', 'city'], // Show error on both fields
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Validate input with better error handling
    const parseResult = registerSchema.safeParse(req.body)
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.flatten())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors
      })
    }
    
    const validatedData = parseResult.data
    const { name, role, password, email: providedEmail, city, farmName, location, phone } = validatedData

    // Enforce role policy
    const roleSetting = getRoleSetting(role)
    if (!roleSetting.canSelfRegister) {
      return res.status(403).json({
        message: `${roleSetting.label}s cannot self-register. Please contact an admin.`,
      })
    }

    let finalEmail: string
    let registrationNumber: string | null = null
    let userCity: string | null = null

    // Branch based on role for email handling
    if (role === 'CUSTOMER') {
      // Use provided real email for customers
      finalEmail = providedEmail!.toLowerCase().trim()
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: finalEmail },
      })

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already registered',
          message: 'This email is already in use. Please sign in or use a different email.',
        })
      }
    } else {
      // Validate city per policy and normalize
      if (roleSetting.requiresCity && !city) {
        return res.status(400).json({ message: 'City is required for this role' })
      }
      const normalizedCity = validateCity(city!)
      
      // Generate email for other roles
      const generatedEmail = await emailGenerator.generateEmail(name, normalizedCity, role)
      finalEmail = generatedEmail.email
      registrationNumber = generatedEmail.registrationNumber
      userCity = generatedEmail.city

      // Check if email already exists (shouldn't happen with our system)
      const existingUser = await prisma.user.findUnique({
        where: { email: finalEmail },
      })

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this combination',
        })
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with role-specific data
    const user = await prisma.user.create({
      data: {
        name,
        email: finalEmail,
        role,
        registrationNumber,
        passwordHash: hashedPassword,
      } as any,
    })

    // Create role-specific profile
    switch (role) {
      case 'CUSTOMER':
        await prisma.customer.create({
          data: {
            userId: user.id,
            phone: phone || null,
          },
        })
        break

      case 'FARMER':
        if (!farmName || !location) {
          throw new Error('Farm name and location required for farmers')
        }
        await prisma.farmer.create({
          data: {
            userId: user.id,
            farmName,
            location,
            phone: phone || null,
            isApproved: false, // Requires admin approval
          },
        })
        
        // Notify admins about new farmer registration
        await notifyAdminsOfNewFarmer(user.id, name, finalEmail, farmName, location)
        break

      case 'ADMIN':
      case 'OPERATIONS':
      case 'DRIVER':
        // These roles might require additional verification
        // For now, just create the user
        break
    }

    // Send welcome email (implement your email service)
    await sendWelcomeEmail(finalEmail, name, role)

    // Return success with appropriate response based on role
    const response: any = {
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }

    // Add credentials info for non-customer roles
    if (role !== 'CUSTOMER') {
      response.credentials = {
        email: finalEmail,
        note: 'Please save this email for login',
      }
    }

    return res.status(201).json(response)
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      })
    }

    return res.status(500).json({
      message: error.message || 'Registration failed',
    })
  }
}

// Send welcome email with role-specific content
async function sendWelcomeEmail(email: string, name: string, role: UserRole) {
  let emailContent: string
  let subject: string

  if (role === 'CUSTOMER') {
    // Simple welcome email for customers without credentials
    subject = 'Welcome to AgroTrack+'
    emailContent = `
      Welcome to AgroTrack+!
      
      Dear ${name},
      
      Your customer account has been successfully created.
      
      You can now:
      - Browse fresh produce from local farmers
      - Place orders and track deliveries
      - Manage subscriptions
      - View your order history
      
      Sign in at: ${process.env.NEXTAUTH_URL || 'https://agrotrack.com'}/auth/signin
      
      Best regards,
      AgroTrack+ Team
    `
  } else {
    // Welcome email with generated credentials for other roles
    const parsed = emailGenerator.parseEmail(email)
    
    if (!parsed) {
      console.error('Failed to parse generated email:', email)
      return
    }

    subject = 'Welcome to AgroTrack+ - Your Credentials'
    emailContent = `
      Welcome to AgroTrack+!
      
      Dear ${name},
      
      Your account has been successfully created as a ${role}.
      
      Your login credentials:
      Email: ${email}
      
      Registration Details:
      - City: ${parsed.city.toUpperCase()}
      - Registration Number: ${parsed.registrationNumber}
      - Role: ${role}
      
      ${role === 'FARMER' ? 'Note: Your account is pending approval from our admin team. You will receive a notification once approved.' : ''}
      
      Please keep this email safe for future reference.
      
      Best regards,
      AgroTrack+ Team
    `
  }

  // TODO: Implement actual email sending
  console.log('Welcome email:', emailContent)
  
  // In production, use your email service:
  // await sendEmail({
  //   to: email,
  //   subject: subject,
  //   text: emailContent,
  // })
}

// Notify admins about new farmer registration
async function notifyAdminsOfNewFarmer(
  userId: string,
  name: string,
  email: string,
  farmName: string,
  location: string
) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true }
    })

    if (admins.length === 0) {
      console.log('No admins found to notify about new farmer registration')
      return
    }

    // Send email notifications to all admins
    const emailPromises = admins.map(async (admin) => {
      try {
        // Create notification log
        await prisma.notificationLog.create({
          data: {
            userId: admin.id,
            type: 'email',
            channel: 'farmer_approval',
            title: 'New Farmer Registration',
            message: `A new farmer has registered and requires approval: ${name} (${farmName}) from ${location}`,
            data: {
              farmerId: userId,
              farmerEmail: email,
              farmName,
              location
            },
            sent: false
          }
        })

        // Email notification disabled - external API removed
        // Store notification in database for manual review
        console.log('[Registration] Admin notification created for farmer:', {
          farmerName: name,
          farmerEmail: email,
          farmName,
          adminEmail: admin.email
        })

        // Update notification log as sent
        await prisma.notificationLog.updateMany({
          where: {
            userId: admin.id,
            channel: 'farmer_approval',
            sent: false,
            data: {
              path: ['farmerId'],
              equals: userId
            }
          },
          data: {
            sent: true,
            sentAt: new Date()
          }
        })
      } catch (emailError) {
        console.error(`Failed to send email to admin ${admin.email}:`, emailError)
        // Continue with other admins even if one fails
      }
    })

    await Promise.all(emailPromises)
    console.log(`Notified ${admins.length} admins about new farmer registration: ${name}`)
  } catch (error) {
    console.error('Error notifying admins:', error)
    // Don't throw - registration should succeed even if notification fails
  }
}
