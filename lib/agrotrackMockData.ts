/**
 * Mock data for AgroTrack dashboard
 * This is temporary data for development purposes
 */

export const mockQuery = {
  farmerLots: [] as Array<{
    id: string
    name: string
    plantedDate: Date
    harvestDate: Date
    quantity: number
    unit: string
    status: 'planted' | 'growing' | 'harvested' | 'packaged' | 'shipped'
    certifications: string[]
  }>,
  consumerDashboard: {
    activeSubscription: {
      plan: "Premium Plan",
      status: "active",
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: "Organic Tomatoes", quantity: "2 kg" },
        { name: "Fresh Spinach", quantity: "1 kg" },
        { name: "Carrots", quantity: "1.5 kg" }
      ]
    },
    recentOrders: [
      {
        id: "1",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
        total: 450,
        items: 3
      },
      {
        id: "2",
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
        total: 380,
        items: 2
      }
    ],
    stats: {
      totalOrders: 12,
      totalSpent: 5400,
      savedAmount: 850
    },
    sustainabilityMetrics: {
      foodMilesReduced: 45,
      carbonFootprint: 120,
      carbonSaved: 85,
      packagingRecycled: 92,
      localFarmersSupported: 8
    },
    orderHistory: [],
    ordersTimeline: [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        orders: 2
      },
      {
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        orders: 1
      }
    ]
  },
  traceabilityData: {
    qrCode: "QR123456789",
    product: "Organic Tomatoes",
    origin: {
      farm: "Green Valley Farm",
      location: "Karnataka, India",
      farmer: "Rajesh Kumar"
    },
    journey: [
      {
        stage: "Planted",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        location: "Green Valley Farm"
      },
      {
        stage: "Harvested",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        location: "Green Valley Farm"
      },
      {
        stage: "Packaged",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: "Processing Center"
      },
      {
        stage: "Shipped",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: "Distribution Hub"
      }
    ]
  }
}
