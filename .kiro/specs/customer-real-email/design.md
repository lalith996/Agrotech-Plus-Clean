# Design Document

## Overview

This design document outlines the architecture for modifying the AgroTrack+ authentication system to support dual email authentication: real email addresses for customers and auto-generated emails for other roles. The design focuses on minimal changes to existing code while maintaining backward compatibility.

### Key Design Principles

1. **Minimal Changes**: Modify only the necessary components to support customer real emails
2. **Backward Compatibility**: All existing accounts continue working without changes
3. **Role-Based Logic**: Use role to determine email handling strategy
4. **Security First**: Maintain all existing security measures
5. **User Experience**: Make registration and sign-in intuitive for all roles

### System Boundaries

- **In Scope**: Customer registration with real email, dual authentication support, registration form updates, profile display updates
- **Out of Scope**: Email verification/confirmation, password reset (existing functionality), social login, changing emails for existing users

## Architecture

### High-Level Changes

```
┌─────────────────────────────────────────────────────────────┐
│                    Registration Flow                         │
│                                                              │
│  User selects role                                          │
│         │                                                    │
│         ├─── CUSTOMER ──────> Enter real email             │
│         │                     Validate format               │
│         │                     Check uniqueness              │
│         │                     Create account                │
│         │                                                    │
│         └─── OTHER ROLES ───> Generate email                │
│                               Use EmailGenerator            │
│                               Create account                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Authentication Flow                        │
│                                                              │
│  User enters email + password                               │
│         │                                                    │
│         ├─── Real email format ──────> Lookup user          │
│         │                              Verify password       │
│         │                              Create session        │
│         │                                                    │
│         └─── Generated email format ─> Lookup user          │
│                                        Verify password       │
│                                        Create session        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

No changes to existing technology stack:
- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT strategy

## Components and Interfaces

### 1. Registration API Modifications

#### Updated Registration Endpoint (`pages/api/auth/register.ts`)

**Changes Required:**

1. Update Zod validation schema to make email optional/conditional
2. Add logic to branch based on role
3. For CUSTOMER: validate and use provided email
4. For other roles: generate email using EmailGenerator

**Updated Schema:**

```typescript
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8),
  
  // Conditional fields based on role
  email: z.string().email().optional(), // For CUSTOMER role
  city: z.enum(SUPPORTED_CITIES).optional(), // For non-CUSTOMER roles
  
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
  message: 'Email required for customers, city required for other roles'
})
```

**Registration Logic Flow:**

```typescript
async function handleRegistration(validatedData) {
  const { name, role, password, email, city, ...roleSpecificData } = validatedData
  
  let finalEmail: string
  let registrationNumber: string | null = null
  let userCity: string | null = null
  
  // Branch based on role
  if (role === 'CUSTOMER') {
    // Use provided real email
    finalEmail = email!.toLowerCase().trim()
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: finalEmail }
    })
    
    if (existing) {
      throw new Error('Email already registered')
    }
  } else {
    // Generate email for other roles
    const generated = await emailGenerator.generateEmail(name, city!, role)
    finalEmail = generated.email
    registrationNumber = generated.registrationNumber
    userCity = generated.city
  }
  
  // Hash password
  const hashedPassword = await hash(password, 12)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email: finalEmail,
      role,
      city: userCity,
      registrationNumber,
      passwordHash: hashedPassword,
    },
  })
  
  // Create role-specific profile
  await createRoleProfile(user, role, roleSpecificData)
  
  // Send welcome email
  await sendWelcomeEmail(user, role)
  
  return user
}
```

### 2. Registration Form Updates

#### Updated Registration Component (`pages/auth/register.tsx`)

**Changes Required:**

1. Add conditional rendering based on selected role
2. Show email input for CUSTOMER role
3. Show city selector for other roles
4. Update email preview logic
5. Update success message display

**Form State:**

```typescript
const [formData, setFormData] = useState({
  name: '',
  role: '' as UserRole | '',
  password: '',
  confirmPassword: '',
  
  // Conditional fields
  email: '', // For CUSTOMER
  city: '', // For other roles
  
  // Role-specific fields
  farmName: '',
  location: '',
  phone: '',
})
```

**Conditional Rendering:**

```tsx
{/* Email input for CUSTOMER role */}
{formData.role === 'CUSTOMER' && (
  <div className="space-y-2">
    <Label htmlFor="email">Email Address *</Label>
    <Input
      id="email"
      type="email"
      placeholder="your.email@gmail.com"
      value={formData.email}
      onChange={(e) => handleChange('email', e.target.value)}
      required
    />
    <p className="text-xs text-gray-600">
      Use your personal email address
    </p>
  </div>
)}

{/* City selector for other roles */}
{formData.role && formData.role !== 'CUSTOMER' && (
  <div className="space-y-2">
    <Label htmlFor="city">City *</Label>
    <Select
      value={formData.city}
      onValueChange={(value) => handleChange('city', value)}
      required
    >
      <SelectTrigger>
        <SelectValue placeholder="Select city" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city.charAt(0).toUpperCase() + city.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

{/* Email preview for non-customer roles */}
{formData.name && formData.city && formData.role && formData.role !== 'CUSTOMER' && (
  <Alert className="bg-blue-50 border-blue-200">
    <Mail className="h-4 w-4 text-blue-600" />
    <AlertDescription className="text-blue-900">
      <p className="text-xs font-semibold mb-1">Your email will be:</p>
      <p className="font-mono text-sm">
        {formData.city.toLowerCase()}.{formData.name.toLowerCase().replace(/\s+/g, '')}.XXX@{formData.role.toLowerCase()}.agrotrack.com
      </p>
      <p className="text-xs mt-1 text-blue-700">
        (XXX will be your unique registration number)
      </p>
    </AlertDescription>
  </Alert>
)}
```

**Success Message Updates:**

```tsx
{success && (
  <Card className="w-full max-w-md">
    <CardHeader className="text-center">
      <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
      <CardTitle>Registration Successful!</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Show different messages based on role */}
      {userRole === 'CUSTOMER' ? (
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-2">Your account is ready!</p>
            <p className="text-sm">
              Sign in with: <span className="font-mono">{userEmail}</span>
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-2">Your Login Email:</p>
            <p className="font-mono text-sm bg-white p-2 rounded border">
              {generatedEmail}
            </p>
            <p className="text-xs mt-2 text-blue-700">
              Please save this email for future login.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
)}
```

### 3. Authentication System

#### NextAuth Configuration (`lib/auth.ts`)

**No Changes Required**

The existing CredentialsProvider already handles both email types:

```typescript
CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null

    // This lookup works for both real and generated emails
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true }
    })

    if (!user || !user.passwordHash) return null

    const ok = await compare(credentials.password, user.passwordHash)
    if (!ok) return null

    return { id: user.id, name: user.name || null, email: user.email, role: user.role } as any
  },
})
```

**Why No Changes:**
- The `findUnique` query works for any email format
- Password comparison is role-agnostic
- Session creation is the same for all roles

### 4. Sign-In Page

#### Sign-In Component (`pages/auth/signin.tsx`)

**Minimal Changes Required:**

Update placeholder text and help text to be more generic:

```tsx
<Input
  id="email"
  type="email"
  placeholder="your.email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
<p className="text-xs text-gray-600">
  Enter your email address (personal or system-generated)
</p>
```

### 5. Profile Display Updates

#### Header Component (`components/layout/role-based-header.tsx`)

**Changes Required:**

Update email display logic to handle both formats:

```typescript
function EmailDisplay({ email, role }: { email: string; role: UserRole }) {
  // Check if it's a generated email
  const parsed = emailGenerator.parseEmail(email)
  
  if (parsed && role !== 'CUSTOMER') {
    // Display parsed components for generated emails
    return (
      <div className="text-sm">
        <div className="font-medium">{email}</div>
        <div className="text-xs text-gray-500">
          {parsed.city.toUpperCase()} • #{parsed.registrationNumber}
        </div>
      </div>
    )
  } else {
    // Display real email for customers
    return (
      <div className="text-sm">
        <div className="font-medium">{email}</div>
      </div>
    )
  }
}
```

### 6. Welcome Email Updates

#### Email Notification Function

**Changes Required:**

Update `sendWelcomeEmail` function to send different content based on role:

```typescript
async function sendWelcomeEmail(user: User, role: UserRole) {
  if (role === 'CUSTOMER') {
    // Simple welcome email for customers
    const emailContent = `
      Welcome to AgroTrack+!
      
      Dear ${user.name},
      
      Your customer account has been successfully created.
      
      You can now:
      - Browse fresh produce from local farmers
      - Place orders and track deliveries
      - Manage subscriptions
      - View your order history
      
      Sign in at: ${process.env.NEXTAUTH_URL}/auth/signin
      
      Best regards,
      AgroTrack+ Team
    `
    
    await sendEmail({
      to: user.email,
      subject: 'Welcome to AgroTrack+',
      text: emailContent,
    })
  } else {
    // Existing welcome email with generated credentials
    const parsed = emailGenerator.parseEmail(user.email)
    
    const emailContent = `
      Welcome to AgroTrack+!
      
      Dear ${user.name},
      
      Your account has been successfully created as a ${role}.
      
      Your login credentials:
      Email: ${user.email}
      
      Registration Details:
      - City: ${parsed?.city.toUpperCase()}
      - Registration Number: ${parsed?.registrationNumber}
      - Role: ${role}
      
      ${role === 'FARMER' ? 'Note: Your account is pending approval from our admin team.' : ''}
      
      Please keep this email safe for future reference.
      
      Best regards,
      AgroTrack+ Team
    `
    
    await sendEmail({
      to: user.email,
      subject: 'Welcome to AgroTrack+ - Your Credentials',
      text: emailContent,
    })
  }
}
```

## Data Models

### Database Schema Changes

**No Schema Changes Required**

The existing User model already supports both email types:

```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique  // Works for both real and generated
  name               String?
  role               UserRole
  city               String?   // Nullable - only for non-customers
  registrationNumber String?   // Nullable - only for non-customers
  passwordHash       String?
  // ... other fields
}
```

**Field Usage by Role:**

| Field | CUSTOMER | Other Roles |
|-------|----------|-------------|
| email | Real email (user-provided) | Generated email |
| city | NULL | City code (e.g., "pune") |
| registrationNumber | NULL | Auto-incremented number |

### EmailRegistry Model

**No Changes Required**

The EmailRegistry continues to work for non-customer roles:

```prisma
model EmailRegistry {
  id        String   @id @default(cuid())
  city      String
  role      UserRole
  count     Int      @default(0)
  
  @@unique([city, role])
}
```

**Usage:**
- CUSTOMER role: EmailRegistry not used
- Other roles: EmailRegistry used as before

## Error Handling

### Registration Errors

**Customer-Specific Errors:**

1. **Invalid Email Format**
```typescript
if (role === 'CUSTOMER' && !isValidEmail(email)) {
  return res.status(400).json({
    error: 'Invalid email format',
    message: 'Please provide a valid email address'
  })
}
```

2. **Duplicate Email**
```typescript
if (role === 'CUSTOMER') {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })
  
  if (existing) {
    return res.status(400).json({
      error: 'Email already registered',
      message: 'This email is already in use. Please sign in or use a different email.'
    })
  }
}
```

3. **Missing Required Fields**
```typescript
if (role === 'CUSTOMER' && !email) {
  return res.status(400).json({
    error: 'Email required',
    message: 'Please provide your email address'
  })
}

if (role !== 'CUSTOMER' && !city) {
  return res.status(400).json({
    error: 'City required',
    message: 'Please select your city'
  })
}
```

### Authentication Errors

**No Changes Required**

Existing error handling works for both email types:

```typescript
// Invalid credentials (works for both email types)
if (!user || !user.passwordHash) {
  return null // NextAuth handles error display
}

const ok = await compare(credentials.password, user.passwordHash)
if (!ok) {
  return null // NextAuth handles error display
}
```

## Testing Strategy

### Unit Testing

**Email Validation:**
- Test valid email formats (Gmail, Yahoo, Outlook, etc.)
- Test invalid email formats
- Test email case-insensitivity
- Test email uniqueness checking

**Registration Logic:**
- Test customer registration with real email
- Test non-customer registration with generated email
- Test role-based branching logic
- Test error handling for each role

**Email Display:**
- Test email parsing for generated emails
- Test email display for real emails
- Test role-based display logic

### Integration Testing

**Registration Flow:**
- Test customer registration end-to-end
- Test farmer registration end-to-end (existing)
- Test email uniqueness across roles
- Test welcome email sending

**Authentication Flow:**
- Test customer sign-in with real email
- Test farmer sign-in with generated email
- Test case-insensitive email lookup
- Test invalid credentials handling

**Profile Display:**
- Test header email display for customers
- Test header email display for other roles
- Test profile page email display

### Manual Testing Checklist

**Customer Registration:**
- [ ] Register with Gmail address
- [ ] Register with Yahoo address
- [ ] Register with custom domain
- [ ] Try duplicate email (should fail)
- [ ] Try invalid email format (should fail)
- [ ] Verify welcome email received

**Customer Sign-In:**
- [ ] Sign in with registered email
- [ ] Sign in with wrong password (should fail)
- [ ] Sign in with non-existent email (should fail)
- [ ] Verify redirect to customer dashboard

**Other Roles (Regression Testing):**
- [ ] Register as farmer (should generate email)
- [ ] Register as admin (should generate email)
- [ ] Sign in with generated email
- [ ] Verify email preview during registration
- [ ] Verify welcome email with credentials

**Profile Display:**
- [ ] View customer profile (should show real email)
- [ ] View farmer profile (should show parsed email)
- [ ] View header as customer
- [ ] View header as farmer

## Performance Considerations

### Database Queries

**No Performance Impact**

- Email lookup remains a single indexed query
- No additional database calls required
- EmailRegistry only queried for non-customer roles

### Caching

**No Changes Required**

- Session caching works the same for both email types
- JWT tokens contain the same information

### Validation

**Minimal Impact**

- Email format validation is fast (regex)
- Uniqueness check is a single indexed query
- No additional validation overhead

## Security Considerations

### Email Validation

**Input Sanitization:**
```typescript
// Normalize email before storage
const normalizedEmail = email.toLowerCase().trim()

// Validate format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(normalizedEmail)) {
  throw new Error('Invalid email format')
}
```

### Uniqueness Enforcement

**Database-Level:**
- Existing `@unique` constraint on User.email prevents duplicates
- Case-insensitive comparison in application code

**Application-Level:**
```typescript
// Always check before insert
const existing = await prisma.user.findUnique({
  where: { email: normalizedEmail }
})

if (existing) {
  throw new Error('Email already registered')
}
```

### Password Security

**No Changes Required**

- Bcrypt hashing remains the same
- Password requirements unchanged
- Session security unchanged

### Privacy Considerations

**Real Email Handling:**
- Real emails are personal data (PII)
- Store securely (existing database security)
- Don't expose in logs or error messages
- Follow existing privacy practices

## Migration Strategy

### Backward Compatibility

**No Migration Required**

- Existing users continue working without changes
- Database schema supports both email types
- Authentication works for all existing accounts

### Rollout Plan

**Phase 1: Deploy Code Changes**
1. Deploy updated registration API
2. Deploy updated registration form
3. Deploy updated email display components

**Phase 2: Monitor**
1. Monitor new customer registrations
2. Verify welcome emails sent correctly
3. Check for any authentication issues

**Phase 3: Validate**
1. Test customer sign-in
2. Verify profile displays correctly
3. Confirm no impact on other roles

### Rollback Plan

**If Issues Occur:**
1. Revert registration API changes
2. Revert registration form changes
3. Existing users unaffected (no data changes)
4. New customer registrations temporarily disabled

## Implementation Notes

### Code Organization

**Files to Modify:**
1. `pages/api/auth/register.ts` - Registration logic
2. `pages/auth/register.tsx` - Registration form
3. `components/layout/role-based-header.tsx` - Email display
4. `pages/api/auth/register.ts` - Welcome email function

**Files Not Modified:**
1. `lib/auth.ts` - Authentication works as-is
2. `lib/email-generator.ts` - Still used for other roles
3. `middleware.ts` - No changes needed
4. `lib/role-access-control.ts` - No changes needed

### Development Workflow

**Step 1: Update Registration API**
- Add conditional logic for role-based email handling
- Update validation schema
- Test with both customer and farmer registrations

**Step 2: Update Registration Form**
- Add conditional rendering
- Update form state
- Test UI for all roles

**Step 3: Update Email Display**
- Add role-based display logic
- Test with both email types

**Step 4: Update Welcome Emails**
- Add role-based email content
- Test email sending

**Step 5: Integration Testing**
- Test complete registration flow
- Test authentication flow
- Test profile display

### Edge Cases

**Case 1: Customer with Generated Email Format**
- If a customer provides email like "city.name.123@customer.agrotrack.com"
- System treats it as a real email (user-provided)
- No special handling needed

**Case 2: Email Case Sensitivity**
- Always normalize to lowercase before storage
- Lookup is case-insensitive
- Display preserves original case (optional)

**Case 3: Existing Customer Accounts**
- If any customers exist with generated emails
- They continue working without changes
- New customers use real emails

## Future Enhancements

### Email Verification (Out of Scope)

**Potential Addition:**
- Send verification email with token
- Require email confirmation before full access
- Add `emailVerified` field to User model

### Password Reset (Out of Scope)

**Potential Addition:**
- Send reset link to real email
- For generated emails, use alternative method
- Add password reset flow

### Email Change (Out of Scope)

**Potential Addition:**
- Allow customers to change email
- Verify new email before updating
- Maintain email change history

### Social Login (Out of Scope)

**Potential Addition:**
- Google OAuth for customers
- Auto-create account with Google email
- Link social accounts to existing accounts
