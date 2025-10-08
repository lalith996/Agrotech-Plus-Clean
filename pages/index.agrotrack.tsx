import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { SustainabilityMetrics } from '@/components/landing/sustainability-metrics'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { ConsumerDashboard } from '@/components/dashboard/consumer-dashboard'
import { LotsTable } from '@/components/farmer/lots-table'
import { QRScanner } from '@/components/qr/qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/lib/stores/user-store'
import { mockStore } from '@/lib/agrotrackMockData'
import { UserRole } from '@/lib/types'

type ViewMode = 'landing' | 'consumer' | 'farmer' | 'qr' | 'ops'

export default function AgroTrackPreview() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { setUser } = useUserStore()

  useEffect(() => {
    // Initialize with mock user data
    setUser(mockStore.user)
  }, [setUser])

  const renderContent = () => {
    switch (viewMode) {
      case 'landing':
        return (
          <>
            <HeroSection />
            <FeatureGrid />
            <SustainabilityMetrics />
          </>
        )
      case 'consumer':
        return (
          <div className="flex h-screen bg-background">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-white px-4 py-2 rounded z-50">
              Skip to main content
            </a>
            <DashboardSidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
              <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
                <ConsumerDashboard />
              </main>
            </div>
          </div>
        )
      case 'farmer':
        return (
          <div className="flex h-screen bg-background">
            <DashboardSidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 overflow-auto p-6">
                <LotsTable />
              </main>
            </div>
          </div>
        )
      case 'qr':
        return (
          <div className="min-h-screen bg-background p-6">
            <QRScanner />
          </div>
        )
      case 'ops':
        return (
          <div className="flex h-screen bg-background">
            <DashboardSidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 overflow-auto p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operations Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Route planning and delivery management interface would be here.
                      This includes drag-and-drop route optimization, real-time tracking,
                      and delivery analytics.
                    </p>
                  </CardContent>
                </Card>
              </main>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar for Preview */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 p-2 bg-card/80 backdrop-blur-sm rounded-lg border">
        <Button 
          size="sm" 
          variant={viewMode === 'landing' ? 'default' : 'ghost'}
          onClick={() => setViewMode('landing')}
        >
          Landing
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'consumer' ? 'default' : 'ghost'}
          onClick={() => {
            setUser({ ...mockStore.user, role: UserRole.CONSUMER })
            setViewMode('consumer')
          }}
        >
          Consumer
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'farmer' ? 'default' : 'ghost'}
          onClick={() => {
            setUser({ ...mockStore.user, role: UserRole.FARMER })
            setViewMode('farmer')
          }}
        >
          Farmer
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'qr' ? 'default' : 'ghost'}
          onClick={() => setViewMode('qr')}
        >
          QR Scanner
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'ops' ? 'default' : 'ghost'}
          onClick={() => {
            setUser({ ...mockStore.user, role: UserRole.OPERATIONS })
            setViewMode('ops')
          }}
        >
          Operations
        </Button>
      </div>

      {renderContent()}
    </div>
  )
}