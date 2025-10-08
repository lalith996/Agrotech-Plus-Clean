import { UserRole, OrderStatus, DeliveryStatus, LotStatus, SubscriptionStatus } from './types';
// Data for global state store
export const mockStore = {
  user: {
    id: "user-1" as const,
    name: "John Smith" as const,
    email: "john@example.com" as const,
    role: UserRole.CONSUMER,
    avatar: "https://i.pravatar.cc/150?img=1" as const
  },
  theme: "light" as const,
  isOffline: false,
  notifications: []
};

// Data returned by API queries
export const mockQuery = {
  consumerDashboard: {
    nextDelivery: new Date('2024-01-15T10:00:00Z'),
    activeSubscription: {
      id: "sub-1" as const,
      plan: "Weekly Organic Box" as const,
      nextDelivery: new Date('2024-01-15T10:00:00Z'),
      status: SubscriptionStatus.ACTIVE
    },
    ordersTimeline: [
      { date: new Date('2024-01-01'), orders: 5 },
      { date: new Date('2024-01-08'), orders: 8 },
      { date: new Date('2024-01-15'), orders: 12 }
    ],
    sustainabilityMetrics: {
      foodMilesReduced: 25,
      carbonSaved: 150,
      packagingRecycled: 95
    }
  },
  farmerLots: [
    {
      id: "lot-1" as const,
      name: "Organic Tomatoes Batch #1" as const,
      plantedDate: new Date('2023-12-01'),
      harvestDate: new Date('2024-01-15'),
      quantity: 500,
      unit: "lbs" as const,
      status: LotStatus.HARVESTED,
      certifications: ["USDA Organic", "Non-GMO"]
    },
    {
      id: "lot-2" as const,
      name: "Leafy Greens Mix" as const,
      plantedDate: new Date('2023-12-15'),
      harvestDate: new Date('2024-01-30'),
      quantity: 300,
      unit: "lbs" as const,
      status: LotStatus.GROWING,
      certifications: ["USDA Organic"]
    },
    {
      id: "lot-3" as const,
      name: "Organic Carrots" as const,
      plantedDate: new Date('2023-11-20'),
      harvestDate: new Date('2024-01-10'),
      quantity: 750,
      unit: "lbs" as const,
      status: LotStatus.PACKAGED,
      certifications: ["USDA Organic", "Rainforest Alliance"]
    }
  ],
  deliveryRoutes: [
    {
      id: "route-1" as const,
      driverId: "driver-1" as const,
      stops: [
        {
          id: "stop-1" as const,
          address: "123 Main St, City, State" as const,
          customer: "Jane Doe" as const,
          status: DeliveryStatus.SCHEDULED,
          estimatedTime: new Date('2024-01-15T09:00:00Z')
        },
        {
          id: "stop-2" as const,
          address: "456 Oak Ave, City, State" as const,
          customer: "Bob Johnson" as const,
          status: DeliveryStatus.SCHEDULED,
          estimatedTime: new Date('2024-01-15T10:30:00Z')
        }
      ]
    }
  ],
  traceabilityData: {
    qrCode: "QR123456789" as const,
    product: "Organic Tomatoes" as const,
    origin: {
      farm: "Green Valley Farm" as const,
      location: "California, USA" as const,
      farmer: "Mike Wilson" as const
    },
    journey: [
      {
        stage: "Planted" as const,
        date: new Date('2023-12-01'),
        location: "Green Valley Farm" as const
      },
      {
        stage: "Harvested" as const,
        date: new Date('2024-01-15'),
        location: "Green Valley Farm" as const
      },
      {
        stage: "Packaged" as const,
        date: new Date('2024-01-16'),
        location: "Processing Center" as const
      }
    ]
  }
};

// Data passed as props to the root component
export const mockRootProps = {
  initialTheme: "light" as const,
  locale: "en" as const
};