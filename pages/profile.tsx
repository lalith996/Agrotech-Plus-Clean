import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { UserRole } from "@prisma/client"

interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  customer?: {
    phone?: string
    addresses: Array<{
      id: string
      name: string
      street: string
      city: string
      state: string
      zipCode: string
      isDefault: boolean
    }>
  }
  farmer?: {
    farmName: string
    location: string
    description?: string
    phone?: string
    isApproved: boolean
    certifications: Array<{
      id: string
      name: string
      issuedBy: string
      issuedDate: string
      expiryDate?: string
    }>
  }
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    farmName: "",
    location: "",
    description: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await response.json()
      setProfile(data.user)
      
      // Set form data
      setFormData({
        name: data.user.name || "",
        phone: data.user.customer?.phone || data.user.farmer?.phone || "",
        farmName: data.user.farmer?.farmName || "",
        location: data.user.farmer?.location || "",
        description: data.user.farmer?.description || "",
      })
    } catch (error) {
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      fetchProfile() // Refresh profile data
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {profile.role === UserRole.FARMER ? "Your Name" : "Full Name"}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91-XXXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                {profile.role === UserRole.FARMER && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="farmName">Farm Name</Label>
                      <Input
                        id="farmName"
                        type="text"
                        value={formData.farmName}
                        onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Farm Location</Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Farm Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell customers about your farm and farming practices..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    {!profile.farmer?.isApproved && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Account Pending Approval
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Your farmer account is pending admin approval. You'll be able to list products once approved.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                {success && (
                  <div className="text-green-600 text-sm">{success}</div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Role-specific information */}
          {profile.role === UserRole.CUSTOMER && profile.customer?.addresses && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Addresses</CardTitle>
                <CardDescription>
                  Manage your delivery addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.customer.addresses.length === 0 ? (
                  <p className="text-gray-500">No addresses added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {profile.customer.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{address.name}</h4>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.zipCode}
                            </p>
                            {address.isDefault && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {profile.role === UserRole.FARMER && profile.farmer?.certifications && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Your farm certifications and credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.farmer.certifications.length === 0 ? (
                  <p className="text-gray-500">No certifications added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {profile.farmer.certifications.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-gray-600">Issued by: {cert.issuedBy}</p>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                          {cert.expiryDate && (
                            <span> • Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}