import { describe, it, expect } from 'vitest'
import { UserRole, OrderStatus, SubscriptionStatus } from '@prisma/client'
import {
  userSchema,
  customerSchema,
  farmerSchema,
  addressSchema,
  productSchema,
  subscriptionSchema,
  subscriptionItemSchema,
  orderSchema,
  orderItemSchema,
  qcResultSchema,
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateFarmerProfileSchema,
} from '@/lib/validations'

describe('User Validation Schemas', () => {
  describe('userSchema', () => {
    it('should validate a valid user object', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
      }
      
      const result = userSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        role: UserRole.CUSTOMER,
      }
      
      const result = userSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('should reject empty name', () => {
      const invalidUser = {
        name: '',
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
      }
      
      const result = userSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const invalidUser = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
      }
      
      const result = userSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })
  })

  describe('customerSchema', () => {
    it('should validate a valid customer object', () => {
      const validCustomer = {
        userId: 'clp123456789',
        phone: '+1234567890',
      }
      
      const result = customerSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('should validate customer without phone', () => {
      const validCustomer = {
        userId: 'clp123456789',
      }
      
      const result = customerSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone number', () => {
      const invalidCustomer = {
        userId: 'clp123456789',
        phone: 'invalid-phone',
      }
      
      const result = customerSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number')
      }
    })
  })

  describe('farmerSchema', () => {
    it('should validate a valid farmer object', () => {
      const validFarmer = {
        userId: 'clp123456789',
        farmName: 'Green Valley Farm',
        location: 'Karnataka, India',
        description: 'Organic vegetable farm',
        phone: '+919876543210',
        isApproved: true,
      }
      
      const result = farmerSchema.safeParse(validFarmer)
      expect(result.success).toBe(true)
    })

    it('should reject empty farm name', () => {
      const invalidFarmer = {
        userId: 'clp123456789',
        farmName: '',
        location: 'Karnataka, India',
      }
      
      const result = farmerSchema.safeParse(invalidFarmer)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Farm name is required')
      }
    })

    it('should reject empty location', () => {
      const invalidFarmer = {
        userId: 'clp123456789',
        farmName: 'Green Valley Farm',
        location: '',
      }
      
      const result = farmerSchema.safeParse(invalidFarmer)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Location is required')
      }
    })

    it('should default isApproved to false', () => {
      const farmer = {
        userId: 'clp123456789',
        farmName: 'Green Valley Farm',
        location: 'Karnataka, India',
      }
      
      const result = farmerSchema.safeParse(farmer)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isApproved).toBe(false)
      }
    })
  })
})

describe('Address Validation Schema', () => {
  describe('addressSchema', () => {
    it('should validate a valid address object', () => {
      const validAddress = {
        customerId: 'clp123456789',
        name: 'Home',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        isDefault: true,
      }
      
      const result = addressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    it('should reject invalid ZIP code format', () => {
      const invalidAddress = {
        customerId: 'clp123456789',
        name: 'Home',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '12345', // Should be 6 digits
      }
      
      const result = addressSchema.safeParse(invalidAddress)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid ZIP code (6 digits required)')
      }
    })

    it('should default isDefault to false', () => {
      const address = {
        customerId: 'clp123456789',
        name: 'Home',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
      }
      
      const result = addressSchema.safeParse(address)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isDefault).toBe(false)
      }
    })
  })
})

describe('Product Validation Schema', () => {
  describe('productSchema', () => {
    it('should validate a valid product object', () => {
      const validProduct = {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        description: 'Fresh organic tomatoes',
        images: ['https://example.com/tomato.jpg'],
        basePrice: 50.0,
        unit: 'kg',
        isActive: true,
        farmerId: 'clp123456789',
      }
      
      const result = productSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('should reject negative price', () => {
      const invalidProduct = {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        basePrice: -10.0,
        unit: 'kg',
        farmerId: 'clp123456789',
      }
      
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price must be positive')
      }
    })

    it('should reject zero price', () => {
      const invalidProduct = {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        basePrice: 0,
        unit: 'kg',
        farmerId: 'clp123456789',
      }
      
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price must be positive')
      }
    })

    it('should default images to empty array', () => {
      const product = {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        basePrice: 50.0,
        unit: 'kg',
        farmerId: 'clp123456789',
      }
      
      const result = productSchema.safeParse(product)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.images).toEqual([])
      }
    })

    it('should default isActive to true', () => {
      const product = {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        basePrice: 50.0,
        unit: 'kg',
        farmerId: 'clp123456789',
      }
      
      const result = productSchema.safeParse(product)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
      }
    })
  })
})

describe('Subscription Validation Schemas', () => {
  describe('subscriptionItemSchema', () => {
    it('should validate a valid subscription item', () => {
      const validItem = {
        subscriptionId: 'clp123456789',
        productId: 'clp987654321',
        quantity: 2.5,
        frequency: 'weekly' as const,
      }
      
      const result = subscriptionItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should reject negative quantity', () => {
      const invalidItem = {
        subscriptionId: 'clp123456789',
        productId: 'clp987654321',
        quantity: -1,
        frequency: 'weekly' as const,
      }
      
      const result = subscriptionItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantity must be positive')
      }
    })

    it('should default frequency to weekly', () => {
      const item = {
        subscriptionId: 'clp123456789',
        productId: 'clp987654321',
        quantity: 2.5,
      }
      
      const result = subscriptionItemSchema.safeParse(item)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.frequency).toBe('weekly')
      }
    })
  })

  describe('subscriptionSchema', () => {
    it('should validate a valid subscription', () => {
      const validSubscription = {
        customerId: 'clp123456789',
        deliveryZone: 'Zone A',
        deliveryDay: 'Monday',
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        items: [
          {
            subscriptionId: 'clp123456789',
            productId: 'clp987654321',
            quantity: 2,
            frequency: 'weekly' as const,
          },
        ],
      }
      
      const result = subscriptionSchema.safeParse(validSubscription)
      expect(result.success).toBe(true)
    })

    it('should reject subscription without items', () => {
      const invalidSubscription = {
        customerId: 'clp123456789',
        deliveryZone: 'Zone A',
        deliveryDay: 'Monday',
        startDate: new Date(),
        items: [],
      }
      
      const result = subscriptionSchema.safeParse(invalidSubscription)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one item is required')
      }
    })
  })
})

describe('Order Validation Schemas', () => {
  describe('orderItemSchema', () => {
    it('should validate a valid order item', () => {
      const validItem = {
        orderId: 'clp123456789',
        productId: 'clp987654321',
        quantity: 2,
        price: 100.0,
      }
      
      const result = orderItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should reject negative price', () => {
      const invalidItem = {
        orderId: 'clp123456789',
        productId: 'clp987654321',
        quantity: 2,
        price: -50.0,
      }
      
      const result = orderItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price must be positive')
      }
    })
  })

  describe('orderSchema', () => {
    it('should validate a valid order', () => {
      const validOrder = {
        customerId: 'clp123456789',
        addressId: 'clp987654321',
        deliverySlot: '9:00-12:00',
        status: OrderStatus.PENDING,
        totalAmount: 200.0,
        deliveryDate: new Date(),
        items: [
          {
            orderId: 'clp123456789',
            productId: 'clp987654321',
            quantity: 2,
            price: 100.0,
          },
        ],
      }
      
      const result = orderSchema.safeParse(validOrder)
      expect(result.success).toBe(true)
    })

    it('should reject order without items', () => {
      const invalidOrder = {
        customerId: 'clp123456789',
        addressId: 'clp987654321',
        deliverySlot: '9:00-12:00',
        totalAmount: 200.0,
        deliveryDate: new Date(),
        items: [],
      }
      
      const result = orderSchema.safeParse(invalidOrder)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one item is required')
      }
    })
  })
})

describe('QC Result Validation Schema', () => {
  describe('qcResultSchema', () => {
    it('should validate a valid QC result', () => {
      const validQCResult = {
        farmerDeliveryId: 'clp123456789',
        productId: 'clp987654321',
        farmerId: 'clp111111111',
        expectedQuantity: 10,
        acceptedQuantity: 8,
        rejectedQuantity: 2,
        rejectionReasons: ['Quality issues', 'Size mismatch'],
        photos: ['https://example.com/photo1.jpg'],
        inspectorId: 'clp222222222',
        notes: 'Some quality issues found',
      }
      
      const result = qcResultSchema.safeParse(validQCResult)
      expect(result.success).toBe(true)
    })

    it('should reject negative accepted quantity', () => {
      const invalidQCResult = {
        farmerDeliveryId: 'clp123456789',
        productId: 'clp987654321',
        farmerId: 'clp111111111',
        expectedQuantity: 10,
        acceptedQuantity: -1,
        rejectedQuantity: 2,
        inspectorId: 'clp222222222',
      }
      
      const result = qcResultSchema.safeParse(invalidQCResult)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Accepted quantity cannot be negative')
      }
    })

    it('should reject negative rejected quantity', () => {
      const invalidQCResult = {
        farmerDeliveryId: 'clp123456789',
        productId: 'clp987654321',
        farmerId: 'clp111111111',
        expectedQuantity: 10,
        acceptedQuantity: 8,
        rejectedQuantity: -1,
        inspectorId: 'clp222222222',
      }
      
      const result = qcResultSchema.safeParse(invalidQCResult)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rejected quantity cannot be negative')
      }
    })

    it('should default arrays to empty', () => {
      const qcResult = {
        farmerDeliveryId: 'clp123456789',
        productId: 'clp987654321',
        farmerId: 'clp111111111',
        expectedQuantity: 10,
        acceptedQuantity: 8,
        rejectedQuantity: 2,
        inspectorId: 'clp222222222',
      }
      
      const result = qcResultSchema.safeParse(qcResult)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rejectionReasons).toEqual([])
        expect(result.data.photos).toEqual([])
      }
    })
  })
})

describe('Authentication Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should validate a valid sign up', () => {
      const validSignUp = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
      }
      
      const result = signUpSchema.safeParse(validSignUp)
      expect(result.success).toBe(true)
    })

    it('should reject short password', () => {
      const invalidSignUp = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        role: UserRole.CUSTOMER,
      }
      
      const result = signUpSchema.safeParse(invalidSignUp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
      }
    })

    it('should default role to CUSTOMER', () => {
      const signUp = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = signUpSchema.safeParse(signUp)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe(UserRole.CUSTOMER)
      }
    })
  })

  describe('signInSchema', () => {
    it('should validate a valid sign in', () => {
      const validSignIn = {
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = signInSchema.safeParse(validSignIn)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidSignIn = {
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = signInSchema.safeParse(invalidSignIn)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })
  })

  describe('changePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const validChange = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }
      
      const result = changePasswordSchema.safeParse(validChange)
      expect(result.success).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const invalidChange = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      }
      
      const result = changePasswordSchema.safeParse(invalidChange)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match")
      }
    })
  })
})

describe('Profile Update Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate a valid profile update', () => {
      const validUpdate = {
        name: 'John Doe Updated',
        phone: '+1234567890',
      }
      
      const result = updateProfileSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate profile update without phone', () => {
      const validUpdate = {
        name: 'John Doe Updated',
      }
      
      const result = updateProfileSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })
  })

  describe('updateFarmerProfileSchema', () => {
    it('should validate a valid farmer profile update', () => {
      const validUpdate = {
        farmName: 'Updated Farm Name',
        location: 'Updated Location',
        description: 'Updated description',
        phone: '+919876543210',
      }
      
      const result = updateFarmerProfileSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('should reject empty farm name', () => {
      const invalidUpdate = {
        farmName: '',
        location: 'Updated Location',
      }
      
      const result = updateFarmerProfileSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Farm name is required')
      }
    })
  })
})