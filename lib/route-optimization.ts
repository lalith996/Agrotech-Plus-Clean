// Minimal stub to keep build green after cleanup
// Provides a basic optimizeRoutes function that returns mock metrics

export type Coordinates = { lat: number; lng: number };

export type DeliveryLocation = {
  id: string;
  customerId: string;
  address: string;
  coordinates: Coordinates;
  timeWindow?: { start: string; end: string };
  serviceTime?: number;
  priority?: 'low' | 'medium' | 'high';
};

export type Vehicle = {
  id: string;
  type?: string;
  capacity?: { weight: number; volume: number };
  startLocation?: Coordinates;
  endLocation?: Coordinates;
  workingHours?: { start: string; end: string };
  costPerKm?: number;
  costPerHour?: number;
};

export type OptimizeOptions = {
  algorithm?: string;
  objectives?: Record<string, number>;
  constraints?: {
    maxRouteTime?: number;
    maxRouteDistance?: number;
    respectTimeWindows?: boolean;
    vehicleCapacityConstraints?: boolean;
  };
  realTimeTraffic?: boolean;
  weatherConsiderations?: boolean;
};

export const routeOptimizer = {
  async optimizeRoutes(
    deliveries: DeliveryLocation[],
    vehicles: Vehicle[],
    _options: OptimizeOptions = {}
  ) {
    // Simple heuristic: assign deliveries round-robin to vehicles
    const routes = vehicles.map((v) => ({
      vehicleId: v.id,
      totalDistance: 0,
      totalTime: 0,
      totalCost: 0,
    }));

    deliveries.forEach((d, idx) => {
      const route = routes[idx % vehicles.length];
      // Mock metrics: distance/time/cost per delivery
      route.totalDistance += 5; // km
      route.totalTime += (d.serviceTime ?? 15) + 10; // minutes
      route.totalCost += 2; // arbitrary units
    });

    const totalDistance = routes.reduce((sum, r) => sum + r.totalDistance, 0);
    const totalTime = routes.reduce((sum, r) => sum + r.totalTime, 0);

    // Mock efficiency calculation
    const efficiency = deliveries.length > 0 ? Math.min(1, 100 / (totalDistance + totalTime / 10)) : 1;

    return {
      routes,
      efficiency,
    };
  },
};