/**
 * Proximal Policy Optimization (PPO) for Dynamic Route Selection
 * 
 * This implementation uses PPO to learn optimal delivery point selection
 * based on current state including location, remaining deliveries, traffic, and time.
 * 
 * State: [current_location, remaining_deliveries, traffic_state, time, capacity_used]
 * Actions: Next delivery point selection
 * Reward: -(delivery_time + fuel_cost + late_penalty)
 */

export interface PPOState {
  current_lat: number;
  current_lng: number;
  remaining_deliveries: number;
  traffic_multiplier: number; // 1.0 = normal, 1.5 = heavy traffic
  current_time_minutes: number; // Minutes since start of day
  capacity_used_percent: number; // 0.0 to 1.0
  time_pressure: number; // Urgency factor based on time windows
}

export interface PPOAction {
  delivery_point_id: string;
  confidence: number; // Model confidence in this action
}

export interface PPOReward {
  delivery_time_penalty: number;
  fuel_cost_penalty: number;
  late_penalty: number;
  efficiency_bonus: number;
  total_reward: number;
}

export interface PPOExperience {
  state: PPOState;
  action: PPOAction;
  reward: number;
  next_state: PPOState;
  done: boolean;
}

export interface PPOHyperparameters {
  learning_rate: number;
  clip_epsilon: number;
  value_coefficient: number;
  entropy_coefficient: number;
  max_grad_norm: number;
  ppo_epochs: number;
  batch_size: number;
  gamma: number; // Discount factor
}

export interface DeliveryPoint {
  id: string;
  lat: number;
  lng: number;
  time_window_start: number;
  time_window_end: number;
  service_time: number;
  priority: number;
  weight: number;
}

export interface PPORouteResult {
  selected_points: string[];
  total_reward: number;
  confidence_scores: number[];
  state_values: number[];
  action_probabilities: number[][];
}

/**
 * PPO Route Optimizer for dynamic delivery point selection
 */
export class PPORouteOptimizer {
  private hyperparams: PPOHyperparameters;
  private experience_buffer: PPOExperience[] = [];
  private state_normalizer: {
    lat_mean: number;
    lat_std: number;
    lng_mean: number;
    lng_std: number;
  };

  constructor(hyperparams?: Partial<PPOHyperparameters>) {
    this.hyperparams = {
      learning_rate: hyperparams?.learning_rate || 0.0003,
      clip_epsilon: hyperparams?.clip_epsilon || 0.2,
      value_coefficient: hyperparams?.value_coefficient || 0.5,
      entropy_coefficient: hyperparams?.entropy_coefficient || 0.01,
      max_grad_norm: hyperparams?.max_grad_norm || 0.5,
      ppo_epochs: hyperparams?.ppo_epochs || 4,
      batch_size: hyperparams?.batch_size || 64,
      gamma: hyperparams?.gamma || 0.99
    };

    // Initialize state normalizer with default values
    this.state_normalizer = {
      lat_mean: 0,
      lat_std: 1,
      lng_mean: 0,
      lng_std: 1
    };
  }

  /**
   * Optimize route selection using PPO
   */
  async optimizeRoute(
    start_lat: number,
    start_lng: number,
    delivery_points: DeliveryPoint[],
    vehicle_capacity: number,
    start_time: number,
    traffic_data?: Map<string, number>
  ): Promise<PPORouteResult> {
    // Initialize state normalizer based on delivery points
    this.initializeStateNormalizer(delivery_points);

    const selected_points: string[] = [];
    const confidence_scores: number[] = [];
    const state_values: number[] = [];
    const action_probabilities: number[][] = [];
    
    let current_lat = start_lat;
    let current_lng = start_lng;
    let current_time = start_time;
    let capacity_used = 0;
    let remaining_points = [...delivery_points];
    let total_reward = 0;

    // Route selection loop
    while (remaining_points.length > 0) {
      // Create current state
      const state = this.createState(
        current_lat,
        current_lng,
        remaining_points.length,
        this.getTrafficMultiplier(current_lat, current_lng, traffic_data),
        current_time,
        capacity_used / vehicle_capacity,
        this.calculateTimePressure(remaining_points, current_time)
      );

      // Get action probabilities for all remaining points
      const action_probs = this.getActionProbabilities(state, remaining_points);
      action_probabilities.push(action_probs);

      // Select best action (delivery point)
      const selected_index = this.selectAction(action_probs);
      const selected_point = remaining_points[selected_index];
      
      selected_points.push(selected_point.id);
      confidence_scores.push(action_probs[selected_index]);

      // Calculate state value
      const state_value = this.calculateStateValue(state, remaining_points);
      state_values.push(state_value);

      // Calculate reward for this action
      const reward = this.calculateReward(
        current_lat,
        current_lng,
        selected_point,
        current_time
      );
      total_reward += reward.total_reward;

      // Update state for next iteration
      const travel_time = this.calculateTravelTime(
        current_lat,
        current_lng,
        selected_point.lat,
        selected_point.lng,
        this.getTrafficMultiplier(current_lat, current_lng, traffic_data)
      );

      current_lat = selected_point.lat;
      current_lng = selected_point.lng;
      current_time += travel_time + selected_point.service_time;
      capacity_used += selected_point.weight;

      // Remove selected point from remaining points
      remaining_points.splice(selected_index, 1);
    }

    return {
      selected_points,
      total_reward,
      confidence_scores,
      state_values,
      action_probabilities
    };
  }

  /**
   * Create normalized state representation
   */
  private createState(
    lat: number,
    lng: number,
    remaining_deliveries: number,
    traffic_multiplier: number,
    current_time: number,
    capacity_used_percent: number,
    time_pressure: number
  ): PPOState {
    return {
      current_lat: (lat - this.state_normalizer.lat_mean) / this.state_normalizer.lat_std,
      current_lng: (lng - this.state_normalizer.lng_mean) / this.state_normalizer.lng_std,
      remaining_deliveries: remaining_deliveries / 50, // Normalize assuming max 50 deliveries
      traffic_multiplier: (traffic_multiplier - 1.0) / 0.5, // Normalize traffic (1.0-1.5 -> 0-1)
      current_time_minutes: current_time / 1440, // Normalize to 0-1 (24 hours)
      capacity_used_percent,
      time_pressure
    };
  }

  /**
   * Calculate action probabilities using policy network approximation
   */
  private getActionProbabilities(state: PPOState, delivery_points: DeliveryPoint[]): number[] {
    // Simplified policy network approximation
    // In a real implementation, this would use a neural network
    
    const probabilities: number[] = [];
    
    for (const point of delivery_points) {
      // Calculate distance factor
      const distance = this.calculateDistance(
        state.current_lat * this.state_normalizer.lat_std + this.state_normalizer.lat_mean,
        state.current_lng * this.state_normalizer.lng_std + this.state_normalizer.lng_mean,
        point.lat,
        point.lng
      );
      
      // Calculate time window urgency
      const time_urgency = this.calculateTimeUrgency(point, state.current_time_minutes * 1440);
      
      // Calculate priority factor
      const priority_factor = point.priority / 4; // Normalize priority (1-4 -> 0.25-1)
      
      // Combine factors into probability (simplified policy)
      let probability = (1 / (1 + distance * 0.1)) * // Distance preference (closer is better)
                       time_urgency * // Time window urgency
                       priority_factor * // Priority weighting
                       (1 - state.capacity_used_percent * 0.3); // Capacity consideration
      
      // Add some exploration noise
      probability += Math.random() * 0.1;
      
      probabilities.push(Math.max(0.01, probability)); // Ensure minimum probability
    }
    
    // Normalize probabilities to sum to 1
    const sum = probabilities.reduce((a, b) => a + b, 0);
    return probabilities.map(p => p / sum);
  }

  /**
   * Select action based on probabilities (with exploration)
   */
  private selectAction(probabilities: number[]): number {
    // Use epsilon-greedy with some randomness for exploration
    const epsilon = 0.1;
    
    if (Math.random() < epsilon) {
      // Random exploration
      return Math.floor(Math.random() * probabilities.length);
    } else {
      // Greedy selection based on probabilities
      let maxProb = -1;
      let maxIndex = 0;
      
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i];
          maxIndex = i;
        }
      }
      
      return maxIndex;
    }
  }

  /**
   * Calculate state value (critic network approximation)
   */
  private calculateStateValue(state: PPOState, remaining_points: DeliveryPoint[]): number {
    // Simplified value function approximation
    // In a real implementation, this would use a neural network
    
    const remaining_factor = 1 - (state.remaining_deliveries * 50) / 100; // More remaining = lower value
    const time_factor = 1 - state.current_time_minutes; // Later in day = lower value
    const capacity_factor = 1 - state.capacity_used_percent; // More capacity used = lower flexibility
    const traffic_factor = 1 - Math.abs(state.traffic_multiplier); // Heavy traffic = lower value
    
    return (remaining_factor + time_factor + capacity_factor + traffic_factor) / 4;
  }

  /**
   * Calculate reward for selecting a delivery point
   */
  private calculateReward(
    current_lat: number,
    current_lng: number,
    delivery_point: DeliveryPoint,
    current_time: number
  ): PPOReward {
    // Calculate travel distance and time
    const distance = this.calculateDistance(current_lat, current_lng, delivery_point.lat, delivery_point.lng);
    const travel_time = this.calculateTravelTime(current_lat, current_lng, delivery_point.lat, delivery_point.lng, 1.0);
    
    // Delivery time penalty (prefer shorter routes)
    const delivery_time_penalty = -(travel_time + delivery_point.service_time) * 0.1;
    
    // Fuel cost penalty (prefer shorter distances)
    const fuel_cost_penalty = -distance * 0.15;
    
    // Late delivery penalty
    const arrival_time = current_time + travel_time;
    const late_penalty = arrival_time > delivery_point.time_window_end ? 
      -(arrival_time - delivery_point.time_window_end) * 2 : 0;
    
    // Efficiency bonus for early/on-time delivery
    const efficiency_bonus = arrival_time <= delivery_point.time_window_end ? 
      delivery_point.priority * 5 : 0;
    
    const total_reward = delivery_time_penalty + fuel_cost_penalty + late_penalty + efficiency_bonus;
    
    return {
      delivery_time_penalty,
      fuel_cost_penalty,
      late_penalty,
      efficiency_bonus,
      total_reward
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Calculate travel time considering traffic
   */
  private calculateTravelTime(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    traffic_multiplier: number
  ): number {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    const base_time = distance * 2; // 2 minutes per km base time
    return base_time * traffic_multiplier;
  }

  /**
   * Get traffic multiplier for current location
   */
  private getTrafficMultiplier(lat: number, lng: number, traffic_data?: Map<string, number>): number {
    if (!traffic_data) return 1.0;
    
    const key = `${Math.round(lat * 100)},${Math.round(lng * 100)}`;
    return traffic_data.get(key) || 1.0;
  }

  /**
   * Calculate time pressure based on remaining deliveries and time windows
   */
  private calculateTimePressure(delivery_points: DeliveryPoint[], current_time: number): number {
    if (delivery_points.length === 0) return 0;
    
    let urgent_count = 0;
    for (const point of delivery_points) {
      const time_until_deadline = point.time_window_end - current_time;
      if (time_until_deadline < 60) { // Less than 1 hour
        urgent_count++;
      }
    }
    
    return urgent_count / delivery_points.length;
  }

  /**
   * Calculate time urgency for a specific delivery point
   */
  private calculateTimeUrgency(point: DeliveryPoint, current_time: number): number {
    const time_until_start = point.time_window_start - current_time;
    const time_until_end = point.time_window_end - current_time;
    
    if (time_until_end < 0) {
      // Past deadline - very low urgency (should avoid)
      return 0.1;
    } else if (time_until_start <= 0 && time_until_end > 0) {
      // Within time window - high urgency
      return 1.0;
    } else if (time_until_start > 0) {
      // Before time window - moderate urgency based on how close
      return Math.max(0.3, 1 - (time_until_start / 120)); // 2 hours normalization
    }
    
    return 0.5; // Default moderate urgency
  }

  /**
   * Initialize state normalizer based on delivery points
   */
  private initializeStateNormalizer(delivery_points: DeliveryPoint[]): void {
    if (delivery_points.length === 0) return;
    
    const lats = delivery_points.map(p => p.lat);
    const lngs = delivery_points.map(p => p.lng);
    
    this.state_normalizer.lat_mean = lats.reduce((a, b) => a + b, 0) / lats.length;
    this.state_normalizer.lng_mean = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    const lat_variance = lats.reduce((sum, lat) => sum + Math.pow(lat - this.state_normalizer.lat_mean, 2), 0) / lats.length;
    const lng_variance = lngs.reduce((sum, lng) => sum + Math.pow(lng - this.state_normalizer.lng_mean, 2), 0) / lngs.length;
    
    this.state_normalizer.lat_std = Math.sqrt(lat_variance) || 1;
    this.state_normalizer.lng_std = Math.sqrt(lng_variance) || 1;
  }

  /**
   * Add experience to buffer for training
   */
  addExperience(experience: PPOExperience): void {
    this.experience_buffer.push(experience);
    
    // Keep buffer size manageable
    if (this.experience_buffer.length > 10000) {
      this.experience_buffer.shift();
    }
  }

  /**
   * Train the PPO model (placeholder for actual neural network training)
   */
  async train(): Promise<{ policy_loss: number; value_loss: number; entropy: number }> {
    // In a real implementation, this would train neural networks
    // For now, return mock training metrics
    
    return {
      policy_loss: Math.random() * 0.1,
      value_loss: Math.random() * 0.05,
      entropy: Math.random() * 0.02
    };
  }

  /**
   * Save model (placeholder)
   */
  async saveModel(path: string): Promise<void> {
    // In a real implementation, this would save neural network weights
    console.log(`Model saved to ${path}`);
  }

  /**
   * Load model (placeholder)
   */
  async loadModel(path: string): Promise<void> {
    // In a real implementation, this would load neural network weights
    console.log(`Model loaded from ${path}`);
  }
}