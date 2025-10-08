// Role-based access control enums
export enum UserRole {
  CONSUMER = 'consumer',
  FARMER = 'farmer',
  OPERATIONS = 'operations',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKED = 'picked',
  ORDER_IN_TRANSIT = 'order_in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  PICKED_UP = 'picked_up',
  DELIVERY_IN_TRANSIT = 'delivery_in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum LotStatus {
  PLANTED = 'planted',
  GROWING = 'growing',
  HARVESTED = 'harvested',
  PACKAGED = 'packaged',
  SHIPPED = 'shipped'
}

export enum NotificationType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info'
}

export enum AnimationVariant {
  FADE_UP = 'fadeUp',
  SLIDE_IN_X = 'slideInX',
  CARD_HOVER = 'cardHover',
  STAGGER_PARENT = 'staggerParent'
}

// Shared interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

// Props types (data passed to components)
export interface PropTypes {
  user: User;
  theme: 'light' | 'dark';
  locale: string;
}

// Store types (global state data)
export interface StoreTypes {
  user: User;
  theme: 'light' | 'dark';
  isOffline: boolean;
  notifications: Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

// Query types (API response data)
export interface QueryTypes {
  consumerDashboard: {
    nextDelivery: Date;
    activeSubscription: {
      id: string;
      plan: string;
      nextDelivery: Date;
      status: SubscriptionStatus;
    };
    ordersTimeline: Array<{
      date: Date;
      orders: number;
    }>;
    sustainabilityMetrics: {
      foodMilesReduced: number;
      carbonSaved: number;
      packagingRecycled: number;
    };
  };
  farmerLots: Array<{
    id: string;
    name: string;
    plantedDate: Date;
    harvestDate: Date;
    quantity: number;
    unit: string;
    status: LotStatus;
    certifications: string[];
  }>;
  deliveryRoutes: Array<{
    id: string;
    driverId: string;
    stops: Array<{
      id: string;
      address: string;
      customer: string;
      status: DeliveryStatus;
      estimatedTime: Date;
    }>;
  }>;
  traceabilityData: {
    qrCode: string;
    product: string;
    origin: {
      farm: string;
      location: string;
      farmer: string;
    };
    journey: Array<{
      stage: string;
      date: Date;
      location: string;
    }>;
  };
}