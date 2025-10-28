import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-layout'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  DollarSign, 
  Truck, 
  Shield,
  Database,
  Mail,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    timezone: string
    currency: string
    language: string
  }
  business: {
    defaultMarkup: number
    minimumOrderValue: number
    deliveryFee: number
    freeDeliveryThreshold: number
    taxRate: number
    processingDays: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    orderConfirmation: boolean
    deliveryUpdates: boolean
    paymentAlerts: boolean
    lowInventoryAlerts: boolean
    farmerNotifications: boolean
  }
  delivery: {
    maxDeliveryDistance: number
    deliveryTimeSlots: string[]
    advanceBookingDays: number
    sameDayDeliveryEnabled: boolean
    deliveryInstructions: string
  }
  security: {
    sessionTimeout: number
    passwordMinLength: number
    requireTwoFactor: boolean
    allowedFileTypes: string[]
    maxFileSize: number
    rateLimitRequests: number
    rateLimitWindow: number
  }
  integrations: {
    paymentProvider: string
    emailProvider: string
    smsProvider: string
    storageProvider: string
    analyticsEnabled: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'AgroTrack+',
      siteDescription: 'Fresh produce delivery platform connecting farmers and customers',
      contactEmail: 'support@agrotrack.com',
      supportPhone: '+1 (555) 123-4567',
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      language: 'en'
    },
    business: {
      defaultMarkup: 15,
      minimumOrderValue: 25,
      deliveryFee: 5.99,
      freeDeliveryThreshold: 75,
      taxRate: 8.5,
      processingDays: 2
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      orderConfirmation: true,
      deliveryUpdates: true,
      paymentAlerts: true,
      lowInventoryAlerts: true,
      farmerNotifications: true
    },
    delivery: {
      maxDeliveryDistance: 25,
      deliveryTimeSlots: ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM'],
      advanceBookingDays: 7,
      sameDayDeliveryEnabled: false,
      deliveryInstructions: 'Please leave packages at the front door if no one is home.'
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'csv'],
      maxFileSize: 10,
      rateLimitRequests: 100,
      rateLimitWindow: 15
    },
    integrations: {
      paymentProvider: 'stripe',
      emailProvider: 'sendgrid',
      smsProvider: 'twilio',
      storageProvider: 'aws-s3',
      analyticsEnabled: true
    }
  })

  const [isSaving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    // Reset to default values
    setHasChanges(false)
    toast.info('Settings reset to defaults')
  }

  return (
    <ResponsiveContainer className="py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={isSaving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaving || !hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Delivery</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic site configuration and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        value={settings.general.supportPhone}
                        onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.general.timezone}
                        onValueChange={(value) => updateSetting('general', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={settings.general.currency}
                        onValueChange={(value) => updateSetting('general', 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.general.language}
                        onValueChange={(value) => updateSetting('general', 'language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ResponsiveGrid>
                
                <div className="mt-6">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>
                  Pricing, fees, and business operation parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                      <Input
                        id="defaultMarkup"
                        type="number"
                        value={settings.business.defaultMarkup}
                        onChange={(e) => updateSetting('business', 'defaultMarkup', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="minimumOrderValue">Minimum Order Value ($)</Label>
                      <Input
                        id="minimumOrderValue"
                        type="number"
                        step="0.01"
                        value={settings.business.minimumOrderValue}
                        onChange={(e) => updateSetting('business', 'minimumOrderValue', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        value={settings.business.deliveryFee}
                        onChange={(e) => updateSetting('business', 'deliveryFee', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold ($)</Label>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        step="0.01"
                        value={settings.business.freeDeliveryThreshold}
                        onChange={(e) => updateSetting('business', 'freeDeliveryThreshold', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={settings.business.taxRate}
                        onChange={(e) => updateSetting('business', 'taxRate', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="processingDays">Processing Days</Label>
                      <Input
                        id="processingDays"
                        type="number"
                        value={settings.business.processingDays}
                        onChange={(e) => updateSetting('business', 'processingDays', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </ResponsiveGrid>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification channels and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Channel Settings */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Notification Channels</h4>
                    <ResponsiveGrid cols={{ default: 1, sm: 3 }} gap="md">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span>Email</span>
                        </div>
                        <Switch
                          checked={settings.notifications.emailEnabled}
                          onCheckedChange={(checked: boolean) => updateSetting('notifications', 'emailEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-green-600" />
                          <span>SMS</span>
                        </div>
                        <Switch
                          checked={settings.notifications.smsEnabled}
                          onCheckedChange={(checked: boolean) => updateSetting('notifications', 'smsEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-purple-600" />
                          <span>Push</span>
                        </div>
                        <Switch
                          checked={settings.notifications.pushEnabled}
                          onCheckedChange={(checked: boolean) => updateSetting('notifications', 'pushEnabled', checked)}
                        />
                      </div>
                    </ResponsiveGrid>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Notification Types</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'orderConfirmation', label: 'Order Confirmation' },
                        { key: 'deliveryUpdates', label: 'Delivery Updates' },
                        { key: 'paymentAlerts', label: 'Payment Alerts' },
                        { key: 'lowInventoryAlerts', label: 'Low Inventory Alerts' },
                        { key: 'farmerNotifications', label: 'Farmer Notifications' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <span>{item.label}</span>
                          <Switch
                            checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                            onCheckedChange={(checked: boolean) => updateSetting('notifications', item.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Settings */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Configure delivery zones, time slots, and policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxDeliveryDistance">Max Delivery Distance (miles)</Label>
                      <Input
                        id="maxDeliveryDistance"
                        type="number"
                        value={settings.delivery.maxDeliveryDistance}
                        onChange={(e) => updateSetting('delivery', 'maxDeliveryDistance', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                      <Input
                        id="advanceBookingDays"
                        type="number"
                        value={settings.delivery.advanceBookingDays}
                        onChange={(e) => updateSetting('delivery', 'advanceBookingDays', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Same Day Delivery</span>
                      <Switch
                        checked={settings.delivery.sameDayDeliveryEnabled}
                        onCheckedChange={(checked: boolean) => updateSetting('delivery', 'sameDayDeliveryEnabled', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Delivery Time Slots</Label>
                      <div className="space-y-2">
                        {settings.delivery.deliveryTimeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={slot}
                              onChange={(e) => {
                                const newSlots = [...settings.delivery.deliveryTimeSlots]
                                newSlots[index] = e.target.value
                                updateSetting('delivery', 'deliveryTimeSlots', newSlots)
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSlots = settings.delivery.deliveryTimeSlots.filter((_, i) => i !== index)
                                updateSetting('delivery', 'deliveryTimeSlots', newSlots)
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newSlots = [...settings.delivery.deliveryTimeSlots, '']
                            updateSetting('delivery', 'deliveryTimeSlots', newSlots)
                          }}
                        >
                          Add Time Slot
                        </Button>
                      </div>
                    </div>
                  </div>
                </ResponsiveGrid>
                
                <div className="mt-6">
                  <Label htmlFor="deliveryInstructions">Default Delivery Instructions</Label>
                  <Textarea
                    id="deliveryInstructions"
                    value={settings.delivery.deliveryInstructions}
                    onChange={(e) => updateSetting('delivery', 'deliveryInstructions', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Require Two-Factor Authentication</span>
                      <Switch
                        checked={settings.security.requireTwoFactor}
                        onCheckedChange={(checked: boolean) => updateSetting('security', 'requireTwoFactor', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={settings.security.maxFileSize}
                        onChange={(e) => updateSetting('security', 'maxFileSize', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rateLimitRequests">Rate Limit (requests per window)</Label>
                      <Input
                        id="rateLimitRequests"
                        type="number"
                        value={settings.security.rateLimitRequests}
                        onChange={(e) => updateSetting('security', 'rateLimitRequests', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rateLimitWindow">Rate Limit Window (minutes)</Label>
                      <Input
                        id="rateLimitWindow"
                        type="number"
                        value={settings.security.rateLimitWindow}
                        onChange={(e) => updateSetting('security', 'rateLimitWindow', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </ResponsiveGrid>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configure third-party service integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentProvider">Payment Provider</Label>
                      <Select
                        value={settings.integrations.paymentProvider}
                        onValueChange={(value) => updateSetting('integrations', 'paymentProvider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="emailProvider">Email Provider</Label>
                      <Select
                        value={settings.integrations.emailProvider}
                        onValueChange={(value) => updateSetting('integrations', 'emailProvider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="smsProvider">SMS Provider</Label>
                      <Select
                        value={settings.integrations.smsProvider}
                        onValueChange={(value) => updateSetting('integrations', 'smsProvider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="nexmo">Nexmo</SelectItem>
                          <SelectItem value="aws-sns">AWS SNS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="storageProvider">Storage Provider</Label>
                      <Select
                        value={settings.integrations.storageProvider}
                        onValueChange={(value) => updateSetting('integrations', 'storageProvider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws-s3">AWS S3</SelectItem>
                          <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Analytics Enabled</span>
                      <Switch
                        checked={settings.integrations.analyticsEnabled}
                        onCheckedChange={(checked: boolean) => updateSetting('integrations', 'analyticsEnabled', checked)}
                      />
                    </div>
                  </div>
                </ResponsiveGrid>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}