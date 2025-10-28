/**
 * Google Maps API Service for Real-time Traffic Data
 * 
 * Integrates with Google Maps APIs to provide:
 * - Real-time traffic conditions
 * - Distance Matrix calculations
 * - Route optimization with traffic considerations
 * - Geocoding and reverse geocoding
 */

export interface TrafficCondition {
  location: {
    lat: number;
    lng: number;
  };
  traffic_level: 'light' | 'moderate' | 'heavy' | 'severe';
  speed_factor: number; // Multiplier for normal travel time (1.0 = normal, 2.0 = twice as long)
  last_updated: string;
}

export interface DistanceMatrixElement {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  duration_in_traffic?: {
    text: string;
    value: number; // seconds with current traffic
  };
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';
}

export interface DistanceMatrixResponse {
  origin_addresses: string[];
  destination_addresses: string[];
  rows: Array<{
    elements: DistanceMatrixElement[];
  }>;
  status: 'OK' | 'INVALID_REQUEST' | 'MAX_ELEMENTS_EXCEEDED' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
}

export interface RouteOptimizationPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface OptimizedRoute {
  waypoint_order: number[];
  total_distance_meters: number;
  total_duration_seconds: number;
  total_duration_in_traffic_seconds: number;
  legs: Array<{
    distance: number;
    duration: number;
    duration_in_traffic: number;
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
  }>;
}

export interface GoogleMapsConfig {
  api_key: string;
  base_url: string;
  rate_limit_per_second: number;
  cache_duration_minutes: number;
}

/**
 * Google Maps API Service
 */
export class GoogleMapsService {
  private config: GoogleMapsConfig;
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private rateLimiter: { requests: number; resetTime: number } = { requests: 0, resetTime: Date.now() + 1000 };

  constructor(config?: Partial<GoogleMapsConfig>) {
    this.config = {
      api_key: config?.api_key || process.env.GOOGLE_MAPS_API_KEY || '',
      base_url: config?.base_url || 'https://maps.googleapis.com/maps/api',
      rate_limit_per_second: config?.rate_limit_per_second || 50,
      cache_duration_minutes: config?.cache_duration_minutes || 15
    };

    if (!this.config.api_key) {
      console.warn('Google Maps API key not configured. Using mock data.');
    }
  }

  /**
   * Get real-time traffic conditions for multiple locations
   */
  async getTrafficConditions(locations: Array<{ lat: number; lng: number }>): Promise<TrafficCondition[]> {
    const cacheKey = `traffic_${locations.map(l => `${l.lat},${l.lng}`).join('_')}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.config.api_key) {
      // Return mock traffic data
      return this.getMockTrafficConditions(locations);
    }

    try {
      await this.checkRateLimit();

      // Use Distance Matrix API with traffic model to get traffic conditions
      const origins = locations.map(l => `${l.lat},${l.lng}`).join('|');
      const destinations = origins; // Same locations for traffic analysis
      
      const url = `${this.config.base_url}/distancematrix/json?` +
        `origins=${encodeURIComponent(origins)}&` +
        `destinations=${encodeURIComponent(destinations)}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${this.config.api_key}`;

      const response = await fetch(url);
      const data: DistanceMatrixResponse = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      // Convert distance matrix response to traffic conditions
      const trafficConditions: TrafficCondition[] = locations.map((location, index) => {
        const element = data.rows[index]?.elements[index];
        let trafficLevel: TrafficCondition['traffic_level'] = 'light';
        let speedFactor = 1.0;

        if (element && element.duration && element.duration_in_traffic) {
          const normalDuration = element.duration.value;
          const trafficDuration = element.duration_in_traffic.value;
          speedFactor = trafficDuration / normalDuration;

          if (speedFactor >= 2.0) {
            trafficLevel = 'severe';
          } else if (speedFactor >= 1.5) {
            trafficLevel = 'heavy';
          } else if (speedFactor >= 1.2) {
            trafficLevel = 'moderate';
          } else {
            trafficLevel = 'light';
          }
        }

        return {
          location,
          traffic_level: trafficLevel,
          speed_factor: speedFactor,
          last_updated: new Date().toISOString()
        };
      });

      // Cache the result
      this.setCache(cacheKey, trafficConditions);
      return trafficConditions;

    } catch (error) {
      console.error('Error fetching traffic conditions:', error);
      return this.getMockTrafficConditions(locations);
    }
  }

  /**
   * Get distance matrix with traffic considerations
   */
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    includeTraffic: boolean = true
  ): Promise<DistanceMatrixResponse> {
    const cacheKey = `distance_matrix_${origins.length}_${destinations.length}_${includeTraffic}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.config.api_key) {
      return this.getMockDistanceMatrix(origins, destinations, includeTraffic);
    }

    try {
      await this.checkRateLimit();

      const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
      const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
      
      let url = `${this.config.base_url}/distancematrix/json?` +
        `origins=${encodeURIComponent(originsStr)}&` +
        `destinations=${encodeURIComponent(destinationsStr)}&` +
        `units=metric&` +
        `key=${this.config.api_key}`;

      if (includeTraffic) {
        url += '&departure_time=now&traffic_model=best_guess';
      }

      const response = await fetch(url);
      const data: DistanceMatrixResponse = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      // Cache the result
      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      return this.getMockDistanceMatrix(origins, destinations, includeTraffic);
    }
  }

  /**
   * Optimize route order using Google Maps Directions API
   */
  async optimizeRouteOrder(
    start: RouteOptimizationPoint,
    waypoints: RouteOptimizationPoint[],
    end?: RouteOptimizationPoint
  ): Promise<OptimizedRoute> {
    const cacheKey = `route_opt_${start.lat}_${start.lng}_${waypoints.length}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    if (!this.config.api_key) {
      return this.getMockOptimizedRoute(start, waypoints, end);
    }

    try {
      await this.checkRateLimit();

      const origin = `${start.lat},${start.lng}`;
      const destination = end ? `${end.lat},${end.lng}` : origin;
      const waypointsStr = waypoints.map(w => `${w.lat},${w.lng}`).join('|');
      
      const url = `${this.config.base_url}/directions/json?` +
        `origin=${encodeURIComponent(origin)}&` +
        `destination=${encodeURIComponent(destination)}&` +
        `waypoints=optimize:true|${encodeURIComponent(waypointsStr)}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${this.config.api_key}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps Directions API error: ${data.status}`);
      }

      // Extract optimized route information
      const route = data.routes[0];
      const waypointOrder = route.waypoint_order || waypoints.map((_, i) => i);
      
      let totalDistance = 0;
      let totalDuration = 0;
      let totalDurationInTraffic = 0;

      const legs = route.legs.map((leg: any) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
        totalDurationInTraffic += leg.duration_in_traffic?.value || leg.duration.value;

        return {
          distance: leg.distance.value,
          duration: leg.duration.value,
          duration_in_traffic: leg.duration_in_traffic?.value || leg.duration.value,
          start_location: leg.start_location,
          end_location: leg.end_location
        };
      });

      const optimizedRoute: OptimizedRoute = {
        waypoint_order: waypointOrder,
        total_distance_meters: totalDistance,
        total_duration_seconds: totalDuration,
        total_duration_in_traffic_seconds: totalDurationInTraffic,
        legs
      };

      // Cache the result
      this.setCache(cacheKey, optimizedRoute);
      return optimizedRoute;

    } catch (error) {
      console.error('Error optimizing route:', error);
      return this.getMockOptimizedRoute(start, waypoints, end);
    }
  }

  /**
   * Convert traffic conditions to speed multipliers for route optimization
   */
  getTrafficMultipliers(trafficConditions: TrafficCondition[]): Map<string, number> {
    const multipliers = new Map<string, number>();
    
    for (const condition of trafficConditions) {
      const key = `${Math.round(condition.location.lat * 100)},${Math.round(condition.location.lng * 100)}`;
      multipliers.set(key, condition.speed_factor);
    }
    
    return multipliers;
  }

  /**
   * Rate limiting to respect Google Maps API limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = now + 1000;
    }
    
    if (this.rateLimiter.requests >= this.config.rate_limit_per_second) {
      const waitTime = this.rateLimiter.resetTime - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = Date.now() + 1000;
    }
    
    this.rateLimiter.requests++;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    const expires = Date.now() + (this.config.cache_duration_minutes * 60 * 1000);
    this.cache.set(key, { data, expires });
  }

  /**
   * Mock data generators for development/fallback
   */
  private getMockTrafficConditions(locations: Array<{ lat: number; lng: number }>): TrafficCondition[] {
    return locations.map(location => ({
      location,
      traffic_level: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as TrafficCondition['traffic_level'],
      speed_factor: 1.0 + Math.random() * 0.8, // 1.0 to 1.8
      last_updated: new Date().toISOString()
    }));
  }

  private getMockDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    includeTraffic: boolean
  ): DistanceMatrixResponse {
    const rows = origins.map(() => ({
      elements: destinations.map(() => {
        const distance = Math.random() * 50000; // 0-50km
        const duration = distance / 15; // ~15 m/s average speed
        const trafficMultiplier = includeTraffic ? 1.0 + Math.random() * 0.5 : 1.0;
        
        return {
          distance: {
            text: `${(distance / 1000).toFixed(1)} km`,
            value: Math.round(distance)
          },
          duration: {
            text: `${Math.round(duration / 60)} min`,
            value: Math.round(duration)
          },
          duration_in_traffic: includeTraffic ? {
            text: `${Math.round(duration * trafficMultiplier / 60)} min`,
            value: Math.round(duration * trafficMultiplier)
          } : undefined,
          status: 'OK' as const
        };
      })
    }));

    return {
      origin_addresses: origins.map(o => `${o.lat}, ${o.lng}`),
      destination_addresses: destinations.map(d => `${d.lat}, ${d.lng}`),
      rows,
      status: 'OK'
    };
  }

  private getMockOptimizedRoute(
    start: RouteOptimizationPoint,
    waypoints: RouteOptimizationPoint[],
    end?: RouteOptimizationPoint
  ): OptimizedRoute {
    // Simple mock optimization - just shuffle waypoints
    const waypointOrder = waypoints.map((_, i) => i).sort(() => Math.random() - 0.5);
    
    const legs = waypointOrder.map((_, index) => ({
      distance: Math.random() * 10000, // 0-10km per leg
      duration: Math.random() * 1800, // 0-30 minutes per leg
      duration_in_traffic: Math.random() * 2400, // 0-40 minutes with traffic
      start_location: index === 0 ? start : waypoints[waypointOrder[index - 1]],
      end_location: waypoints[waypointOrder[index]]
    }));

    return {
      waypoint_order: waypointOrder,
      total_distance_meters: legs.reduce((sum, leg) => sum + leg.distance, 0),
      total_duration_seconds: legs.reduce((sum, leg) => sum + leg.duration, 0),
      total_duration_in_traffic_seconds: legs.reduce((sum, leg) => sum + leg.duration_in_traffic, 0),
      legs
    };
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();