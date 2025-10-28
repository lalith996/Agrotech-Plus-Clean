import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { getActiveCities } from '@/lib/config/cities'
import { getRoleSetting } from '@/lib/config/roles'


export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [userRole, setUserRole] = useState<UserRole | ''>('')
  const [userEmail, setUserEmail] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '', // For CUSTOMER role
    city: '', // For non-CUSTOMER roles
    role: '' as UserRole | '',
    password: '',
    confirmPassword: '',
    // Role-specific fields
    farmName: '',
    location: '',
    phone: '',
  })
  const [emailError, setEmailError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Role-based registration policy
    if (formData.role) {
      const rs = getRoleSetting(formData.role as UserRole)
      if (!rs.canSelfRegister) {
        setError(`${rs.label}s cannot self-register. Please contact admin.`)
        setLoading(false)
        return
      }
    }

    if (formData.role === 'CUSTOMER' && !formData.email) {
      setError('Email is required for customers')
      setLoading(false)
      return
    }

    if (formData.role !== 'CUSTOMER' && !formData.city) {
      setError('City is required')
      setLoading(false)
      return
    }

    if (formData.role === 'FARMER' && (!formData.farmName || !formData.location)) {
      setError('Farm name and location are required for farmers')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          city: formData.city || undefined,
          role: formData.role,
          password: formData.password,
          farmName: formData.farmName || undefined,
          location: formData.location || undefined,
          phone: formData.phone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Success
      setSuccess(true)
      setUserRole(formData.role)
      
      // Store email based on role
      if (formData.role === 'CUSTOMER') {
        setUserEmail(formData.email)
      } else {
        setGeneratedEmail(data.credentials.email)
      }

      // Redirect to signin after 5 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Real-time email validation for customers
    if (field === 'email' && formData.role === 'CUSTOMER') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-earth-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>
              {userRole === 'CUSTOMER' 
                ? 'Your customer account is ready' 
                : 'Your account has been created'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Different messages based on role */}
            {userRole === 'CUSTOMER' ? (
              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="font-semibold mb-2">Your account is ready!</p>
                  <p className="text-sm mb-2">
                    Sign in with: <span className="font-mono font-semibold">{userEmail}</span>
                  </p>
                  <p className="text-xs text-blue-700">
                    A welcome email has been sent to your address.
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
                    Please save this email for future login. A confirmation has been sent to this address.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {userRole === 'FARMER' && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 text-sm">
                  Your farmer account is pending approval from our admin team. You will receive a notification once approved.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-center text-sm text-gray-600">
              Redirecting to sign in page in 5 seconds...
            </p>

            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-brand hover:bg-brand-700"
            >
              Go to Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-earth-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join AgroTrack+ to start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

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
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-xs text-red-600">{emailError}</p>
                  )}
                  {!emailError && formData.email && (
                    <p className="text-xs text-gray-600">
                      Use your personal email address
                    </p>
                  )}
                </div>
              )}

              {/* City selector for non-CUSTOMER roles */}
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
                      {getActiveCities().map((c) => (
                        <SelectItem key={c.code} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Select your operating city
                  </p>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Register As *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer - Buy fresh produce</SelectItem>
                  <SelectItem value="FARMER">Farmer - Sell your products</SelectItem>
                  <SelectItem value="DRIVER" disabled>Driver - Provisioned by admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                Admin, Operations, and Driver accounts are provisioned by administrators.
              </p>
            </div>

            {/* Email Preview - Only for non-customer roles */}
            {formData.name && formData.city && formData.role && formData.role !== 'CUSTOMER' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="text-xs font-semibold mb-1">Your auto-generated email will be:</p>
                  <p className="font-mono text-sm">
                    {formData.city.toLowerCase()}.{formData.name.toLowerCase().replace(/\s+/g, '')}.XXX@{formData.role.toLowerCase()}.agrotrack.com
                  </p>
                  <p className="text-xs mt-1 text-blue-700">
                    (XXX will be your unique registration number - save this email for login)
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Farmer-specific fields */}
            {formData.role === 'FARMER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="farmName">Farm Name *</Label>
                  <Input
                    id="farmName"
                    placeholder="Green Valley Farms"
                    value={formData.farmName}
                    onChange={(e) => handleChange('farmName', e.target.value)}
                    required={formData.role === 'FARMER'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Farm Location *</Label>
                  <Input
                    id="location"
                    placeholder="Village, District"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    required={formData.role === 'FARMER'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-brand hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
