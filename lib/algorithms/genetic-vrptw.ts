/**
 * Genetic Algorithm for Vehicle Routing Problem with Time Windows (VRPTW)
 * 
 * This implementation follows the specification:
 * - Population: 200
 * - Generations: 500
 * - Crossover rate: 0.8
 * - Mutation rate: 0.2
 * - Objectives: minimize_distance, minimize_time, maximize_on_time
 * - Constraints: vehicle_capacity, time_windows, driver_hours, traffic
 */

export interface VRPTWOrder {
  id: string
  customer_id: string
  address: {
    lat: number
    lng: number
    formatted: string
  }
  items: Array<{
    product_id: string
    quantity: number
    weight_kg: number
  }>
  time_window: {
    start: string // ISO datetime
    end: string   // ISO datetime
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  service_time_min: number // Time needed for delivery
}

export interface VRPTWVehicle {
  id: string
  type: 'van' | 'truck' | 'motorcycle'
  capacity_kg: number
  max_distance_km: number
  driver_id: string
  current_location: {
    lat: number
    lng: number
  }
  available_hours: number
  cost_per_km: number
}

export interface VRPTWConstraints {
  max_route_duration_hours: number
  max_stops_per_vehicle: number
  driver_break_duration_min: number
  fuel_cost_per_km: number
  traffic_factor: number // 1.0 = no traffic, 1.5 = heavy traffic
}

export interface VRPTWGeneticParams {
  population_size: number
  generations: number
  crossover_rate: number
  mutation_rate: number
  elite_size: number
  tournament_size: number
}

export interface VRPTWRoute {
  vehicle_id: string
  driver_id: string
  stops: Array<{
    order_id: string
    sequence: number
    estimated_arrival: Date
    estimated_departure: Date
    travel_time_from_previous_min: number
    distance_from_previous_km: number
    waiting_time_min: number
    late_penalty: number
  }>
  total_distance_km: number
  total_duration_min: number
  fuel_cost: number
  efficiency_score: number
  capacity_utilization: number
  on_time_deliveries: number
}

export interface VRPTWSolution {
  routes: VRPTWRoute[]
  total_distance_km: number
  total_duration_min: number
  total_fuel_cost: number
  fitness_score: number
  objectives: {
    distance_score: number
    time_score: number
    on_time_score: number
  }
  constraint_violations: number
}

export class GeneticVRPTW {
  private orders: VRPTWOrder[]
  private vehicles: VRPTWVehicle[]
  private constraints: VRPTWConstraints
  private params: VRPTWGeneticParams
  private distanceMatrix: number[][] = []
  private timeMatrix: number[][] = []
  private useExternalMatrices: boolean = false
  private pointIndexByCoord: Map<string, number> = new Map()

  constructor(
    orders: VRPTWOrder[],
    vehicles: VRPTWVehicle[],
    constraints: VRPTWConstraints,
    params?: Partial<VRPTWGeneticParams>
  ) {
    this.orders = orders
    this.vehicles = vehicles
    this.constraints = constraints
    this.params = {
      population_size: params?.population_size || 200,
      generations: params?.generations || 500,
      crossover_rate: params?.crossover_rate || 0.8,
      mutation_rate: params?.mutation_rate || 0.2,
      elite_size: params?.elite_size || 20,
      tournament_size: params?.tournament_size || 5
    }

    // Pre-calculate distance and time matrices (defaults)
    this.calculateDistanceMatrix()
    this.calculateTimeMatrix()
  }

  /**
   * Main optimization method
   */
  public optimize(): VRPTWSolution {
    console.log(`Starting VRPTW optimization with ${this.orders.length} orders and ${this.vehicles.length} vehicles`)
    
    // Initialize population
    let population = this.initializePopulation()
    
    // Evaluate initial population
    population.forEach(solution => {
      solution.fitness_score = this.evaluateFitness(solution)
    })

    let bestSolution = this.getBestSolution(population)
    let generationsWithoutImprovement = 0

    // Evolution loop
    for (let generation = 0; generation < this.params.generations; generation++) {
      // Selection, crossover, and mutation
      const newPopulation: VRPTWSolution[] = []
      
      // Keep elite solutions
      const sortedPopulation = population.sort((a, b) => b.fitness_score - a.fitness_score)
      for (let i = 0; i < this.params.elite_size; i++) {
        newPopulation.push(this.cloneSolution(sortedPopulation[i]))
      }

      // Generate offspring
      while (newPopulation.length < this.params.population_size) {
        const parent1 = this.tournamentSelection(population)
        const parent2 = this.tournamentSelection(population)

        if (Math.random() < this.params.crossover_rate) {
          const offspring = this.crossover(parent1, parent2)
          
          if (Math.random() < this.params.mutation_rate) {
            this.mutate(offspring)
          }
          
          offspring.fitness_score = this.evaluateFitness(offspring)
          newPopulation.push(offspring)
        } else {
          newPopulation.push(this.cloneSolution(parent1))
        }
      }

      population = newPopulation
      const currentBest = this.getBestSolution(population)

      // Check for improvement
      if (currentBest.fitness_score > bestSolution.fitness_score) {
        bestSolution = currentBest
        generationsWithoutImprovement = 0
      } else {
        generationsWithoutImprovement++
      }

      // Early termination if no improvement
      if (generationsWithoutImprovement > 50) {
        console.log(`Early termination at generation ${generation}`)
        break
      }

      // Log progress every 50 generations
      if (generation % 50 === 0) {
        console.log(`Generation ${generation}: Best fitness = ${bestSolution.fitness_score.toFixed(2)}`)
      }
    }

    console.log(`Optimization completed. Best fitness: ${bestSolution.fitness_score.toFixed(2)}`)
    return bestSolution
  }

  /**
   * Initialize random population
   */
  private initializePopulation(): VRPTWSolution[] {
    const population: VRPTWSolution[] = []

    for (let i = 0; i < this.params.population_size; i++) {
      const solution = this.createRandomSolution()
      population.push(solution)
    }

    return population
  }

  /**
   * Create a random solution
   */
  private createRandomSolution(): VRPTWSolution {
    const routes: VRPTWRoute[] = []
    const unassignedOrders = [...this.orders]

    // Shuffle orders for randomness
    for (let i = unassignedOrders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[unassignedOrders[i], unassignedOrders[j]] = [unassignedOrders[j], unassignedOrders[i]]
    }

    // Assign orders to vehicles using nearest neighbor with capacity constraints
    for (const vehicle of this.vehicles) {
      const route = this.createRouteForVehicle(vehicle, unassignedOrders)
      if (route.stops.length > 0) {
        routes.push(route)
      }
    }

    return this.createSolutionFromRoutes(routes)
  }

  /**
   * Create route for a specific vehicle
   */
  private createRouteForVehicle(vehicle: VRPTWVehicle, availableOrders: VRPTWOrder[]): VRPTWRoute {
    const route: VRPTWRoute = {
      vehicle_id: vehicle.id,
      driver_id: vehicle.driver_id,
      stops: [],
      total_distance_km: 0,
      total_duration_min: 0,
      fuel_cost: 0,
      efficiency_score: 0,
      capacity_utilization: 0,
      on_time_deliveries: 0
    }

    let currentLocation = vehicle.current_location
    let currentTime = new Date()
    let currentCapacity = 0
    let totalDistance = 0

    while (availableOrders.length > 0 && route.stops.length < this.constraints.max_stops_per_vehicle) {
      let bestOrderIndex = -1
      let bestScore = -Infinity

      // Find best next order considering distance, time windows, and priority
      for (let i = 0; i < availableOrders.length; i++) {
        const order = availableOrders[i]
        const orderWeight = order.items.reduce((sum, item) => sum + item.weight_kg, 0)

        // Check capacity constraint
        if (currentCapacity + orderWeight > vehicle.capacity_kg) continue

        const distance = this.getDistance(currentLocation, order.address)
        const travelTime = this.getTravelTime(currentLocation, order.address)
        const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000)
        
        // Check time window constraint
        const timeWindowStart = new Date(order.time_window.start)
        const timeWindowEnd = new Date(order.time_window.end)
        
        if (arrivalTime > timeWindowEnd) continue // Too late

        // Calculate score based on multiple factors
        const distanceScore = 1 / (1 + distance) // Prefer closer orders
        const timeScore = arrivalTime < timeWindowStart ? 0.5 : 1.0 // Prefer orders within time window
        const priorityScore = this.getPriorityScore(order.priority)
        
        const score = distanceScore * 0.4 + timeScore * 0.4 + priorityScore * 0.2

        if (score > bestScore) {
          bestScore = score
          bestOrderIndex = i
        }
      }

      if (bestOrderIndex === -1) break // No feasible orders

      // Add best order to route
      const selectedOrder = availableOrders.splice(bestOrderIndex, 1)[0]
      const orderWeight = selectedOrder.items.reduce((sum, item) => sum + item.weight_kg, 0)
      const distance = this.getDistance(currentLocation, selectedOrder.address)
      const travelTime = this.getTravelTime(currentLocation, selectedOrder.address)
      
      const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000)
      const timeWindowStart = new Date(selectedOrder.time_window.start)
      const waitingTime = Math.max(0, timeWindowStart.getTime() - arrivalTime.getTime()) / 60000
      const serviceStart = new Date(Math.max(arrivalTime.getTime(), timeWindowStart.getTime()))
      const departureTime = new Date(serviceStart.getTime() + selectedOrder.service_time_min * 60000)

      route.stops.push({
        order_id: selectedOrder.id,
        sequence: route.stops.length + 1,
        estimated_arrival: arrivalTime,
        estimated_departure: departureTime,
        travel_time_from_previous_min: travelTime,
        distance_from_previous_km: distance,
        waiting_time_min: waitingTime,
        late_penalty: arrivalTime > new Date(selectedOrder.time_window.end) ? 100 : 0
      })

      currentLocation = selectedOrder.address
      currentTime = departureTime
      currentCapacity += orderWeight
      totalDistance += distance
    }

    // Calculate route metrics
    route.total_distance_km = totalDistance
    route.total_duration_min = (currentTime.getTime() - new Date().getTime()) / 60000
    route.fuel_cost = totalDistance * vehicle.cost_per_km
    route.capacity_utilization = currentCapacity / vehicle.capacity_kg
    route.on_time_deliveries = route.stops.filter(stop => stop.late_penalty === 0).length
    route.efficiency_score = this.calculateRouteEfficiency(route)

    return route
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(population: VRPTWSolution[]): VRPTWSolution {
    const tournament: VRPTWSolution[] = []
    
    for (let i = 0; i < this.params.tournament_size; i++) {
      const randomIndex = Math.floor(Math.random() * population.length)
      tournament.push(population[randomIndex])
    }

    return tournament.reduce((best, current) => 
      current.fitness_score > best.fitness_score ? current : best
    )
  }

  /**
   * Order crossover (OX) for route optimization
   */
  private crossover(parent1: VRPTWSolution, parent2: VRPTWSolution): VRPTWSolution {
    // Simplified crossover - combine best routes from both parents
    const childRoutes: VRPTWRoute[] = []
    const usedOrders = new Set<string>()

    // Take best routes from parent1
    const sortedRoutes1 = parent1.routes.sort((a, b) => b.efficiency_score - a.efficiency_score)
    const sortedRoutes2 = parent2.routes.sort((a, b) => b.efficiency_score - a.efficiency_score)

    // Add routes from parent1 first
    for (const route of sortedRoutes1) {
      const routeOrders = route.stops.map(stop => stop.order_id)
      if (!routeOrders.some(orderId => usedOrders.has(orderId))) {
        childRoutes.push(this.cloneRoute(route))
        routeOrders.forEach(orderId => usedOrders.add(orderId))
      }
    }

    // Add non-conflicting routes from parent2
    for (const route of sortedRoutes2) {
      const routeOrders = route.stops.map(stop => stop.order_id)
      if (!routeOrders.some(orderId => usedOrders.has(orderId))) {
        childRoutes.push(this.cloneRoute(route))
        routeOrders.forEach(orderId => usedOrders.add(orderId))
      }
    }

    return this.createSolutionFromRoutes(childRoutes)
  }

  /**
   * Mutation operator
   */
  private mutate(solution: VRPTWSolution): void {
    if (solution.routes.length === 0) return

    const mutationType = Math.random()

    if (mutationType < 0.4) {
      // Swap mutation - swap two orders within a route
      this.swapMutation(solution)
    } else if (mutationType < 0.7) {
      // Insert mutation - move order to different position
      this.insertMutation(solution)
    } else {
      // Route exchange - move order between routes
      this.routeExchangeMutation(solution)
    }
  }

  private swapMutation(solution: VRPTWSolution): void {
    const route = solution.routes[Math.floor(Math.random() * solution.routes.length)]
    if (route.stops.length < 2) return

    const i = Math.floor(Math.random() * route.stops.length)
    const j = Math.floor(Math.random() * route.stops.length)
    
    if (i !== j) {
      [route.stops[i], route.stops[j]] = [route.stops[j], route.stops[i]]
      this.recalculateRoute(route)
    }
  }

  private insertMutation(solution: VRPTWSolution): void {
    const route = solution.routes[Math.floor(Math.random() * solution.routes.length)]
    if (route.stops.length < 2) return

    const fromIndex = Math.floor(Math.random() * route.stops.length)
    const toIndex = Math.floor(Math.random() * route.stops.length)
    
    if (fromIndex !== toIndex) {
      const stop = route.stops.splice(fromIndex, 1)[0]
      route.stops.splice(toIndex, 0, stop)
      this.recalculateRoute(route)
    }
  }

  private routeExchangeMutation(solution: VRPTWSolution): void {
    if (solution.routes.length < 2) return

    const route1Index = Math.floor(Math.random() * solution.routes.length)
    const route2Index = Math.floor(Math.random() * solution.routes.length)
    
    if (route1Index === route2Index) return

    const route1 = solution.routes[route1Index]
    const route2 = solution.routes[route2Index]
    
    if (route1.stops.length === 0 || route2.stops.length === 0) return

    const stop1Index = Math.floor(Math.random() * route1.stops.length)
    const stop2Index = Math.floor(Math.random() * route2.stops.length)
    
    // Exchange stops between routes
    const stop1 = route1.stops.splice(stop1Index, 1)[0]
    const stop2 = route2.stops.splice(stop2Index, 1)[0]
    
    route1.stops.splice(stop1Index, 0, stop2)
    route2.stops.splice(stop2Index, 0, stop1)
    
    this.recalculateRoute(route1)
    this.recalculateRoute(route2)
  }

  /**
   * Evaluate fitness of a solution
   */
  private evaluateFitness(solution: VRPTWSolution): number {
    const distanceWeight = 0.4
    const timeWeight = 0.3
    const onTimeWeight = 0.3

    // Normalize objectives (lower is better for distance and time, higher is better for on-time)
    const maxDistance = Math.max(...solution.routes.map(r => r.total_distance_km), 1)
    const maxTime = Math.max(...solution.routes.map(r => r.total_duration_min), 1)
    const totalOrders = this.orders.length

    const distanceScore = 1 - (solution.total_distance_km / (maxDistance * solution.routes.length))
    const timeScore = 1 - (solution.total_duration_min / (maxTime * solution.routes.length))
    const onTimeScore = solution.routes.reduce((sum, route) => sum + route.on_time_deliveries, 0) / totalOrders

    solution.objectives = {
      distance_score: distanceScore,
      time_score: timeScore,
      on_time_score: onTimeScore
    }

    // Apply penalty for constraint violations
    const penalty = solution.constraint_violations * 1000

    return (distanceScore * distanceWeight + timeScore * timeWeight + onTimeScore * onTimeWeight) * 1000 - penalty
  }

  /**
   * Helper methods
   */
  private calculateDistanceMatrix(): void {
    const allPoints = [
      ...this.vehicles.map(v => v.current_location),
      ...this.orders.map(o => o.address)
    ]

    this.distanceMatrix = allPoints.map(point1 =>
      allPoints.map(point2 => this.haversineDistance(point1, point2))
    )
  }

  private calculateTimeMatrix(): void {
    this.timeMatrix = this.distanceMatrix.map(row =>
      row.map(distance => distance * 2 * this.constraints.traffic_factor) // Assume 2 min/km with traffic
    )
  }

  private haversineDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371 // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  /**
   * Inject external distance/time matrices computed from services (e.g., Google Maps)
   * allPoints must be in the same order used to build the matrices.
   * distanceMatrixKm: kilometers; timeMatrixMin: minutes.
   */
  public useMatrices(distanceMatrixKm: number[][], timeMatrixMin: number[][], allPoints: Array<{ lat: number; lng: number }>): void {
    if (
      distanceMatrixKm.length !== timeMatrixMin.length ||
      distanceMatrixKm.length !== allPoints.length
    ) {
      throw new Error('Matrix dimensions must match number of points')
    }
    this.distanceMatrix = distanceMatrixKm
    this.timeMatrix = timeMatrixMin
    this.useExternalMatrices = true
    this.pointIndexByCoord = new Map()
    allPoints.forEach((p, idx) => {
      const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
      this.pointIndexByCoord.set(key, idx)
    })
  }

  private getDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    if (this.useExternalMatrices) {
      const i = this.pointIndexByCoord.get(`${point1.lat.toFixed(6)},${point1.lng.toFixed(6)}`)
      const j = this.pointIndexByCoord.get(`${point2.lat.toFixed(6)},${point2.lng.toFixed(6)}`)
      if (i !== undefined && j !== undefined && this.distanceMatrix[i] && this.distanceMatrix[i][j] !== undefined) {
        return this.distanceMatrix[i][j]
      }
    }
    return this.haversineDistance(point1, point2)
  }

  private getTravelTime(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    if (this.useExternalMatrices) {
      const i = this.pointIndexByCoord.get(`${point1.lat.toFixed(6)},${point1.lng.toFixed(6)}`)
      const j = this.pointIndexByCoord.get(`${point2.lat.toFixed(6)},${point2.lng.toFixed(6)}`)
      if (i !== undefined && j !== undefined && this.timeMatrix[i] && this.timeMatrix[i][j] !== undefined) {
        return this.timeMatrix[i][j]
      }
    }
    return this.getDistance(point1, point2) * 2 * this.constraints.traffic_factor
  }

  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'urgent': return 1.0
      case 'high': return 0.8
      case 'medium': return 0.6
      case 'low': return 0.4
      default: return 0.5
    }
  }

  private calculateRouteEfficiency(route: VRPTWRoute): number {
    if (route.stops.length === 0) return 0
    
    const distanceEfficiency = 1 / (1 + route.total_distance_km / route.stops.length)
    const timeEfficiency = 1 / (1 + route.total_duration_min / route.stops.length)
    const capacityEfficiency = route.capacity_utilization
    const onTimeEfficiency = route.on_time_deliveries / route.stops.length

    return (distanceEfficiency + timeEfficiency + capacityEfficiency + onTimeEfficiency) / 4 * 100
  }

  private createSolutionFromRoutes(routes: VRPTWRoute[]): VRPTWSolution {
    const totalDistance = routes.reduce((sum, route) => sum + route.total_distance_km, 0)
    const totalDuration = Math.max(...routes.map(route => route.total_duration_min), 0)
    const totalFuelCost = routes.reduce((sum, route) => sum + route.fuel_cost, 0)

    return {
      routes,
      total_distance_km: totalDistance,
      total_duration_min: totalDuration,
      total_fuel_cost: totalFuelCost,
      fitness_score: 0,
      objectives: { distance_score: 0, time_score: 0, on_time_score: 0 },
      constraint_violations: this.countConstraintViolations(routes)
    }
  }

  private countConstraintViolations(routes: VRPTWRoute[]): number {
    let violations = 0

    for (const route of routes) {
      // Check duration constraint
      if (route.total_duration_min > this.constraints.max_route_duration_hours * 60) {
        violations++
      }

      // Check stops constraint
      if (route.stops.length > this.constraints.max_stops_per_vehicle) {
        violations++
      }

      // Check late deliveries
      violations += route.stops.filter(stop => stop.late_penalty > 0).length
    }

    return violations
  }

  private recalculateRoute(route: VRPTWRoute): void {
    // Recalculate route metrics after mutation
    let totalDistance = 0
    let currentTime = new Date()
    
    const vehicle = this.vehicles.find(v => v.id === route.vehicle_id)!
    let currentLocation = vehicle.current_location

    for (let i = 0; i < route.stops.length; i++) {
      const stop = route.stops[i]
      const order = this.orders.find(o => o.id === stop.order_id)!
      
      const distance = this.getDistance(currentLocation, order.address)
      const travelTime = this.getTravelTime(currentLocation, order.address)
      
      const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000)
      const timeWindowStart = new Date(order.time_window.start)
      const waitingTime = Math.max(0, timeWindowStart.getTime() - arrivalTime.getTime()) / 60000
      const serviceStart = new Date(Math.max(arrivalTime.getTime(), timeWindowStart.getTime()))
      const departureTime = new Date(serviceStart.getTime() + order.service_time_min * 60000)

      stop.sequence = i + 1
      stop.estimated_arrival = arrivalTime
      stop.estimated_departure = departureTime
      stop.travel_time_from_previous_min = travelTime
      stop.distance_from_previous_km = distance
      stop.waiting_time_min = waitingTime
      stop.late_penalty = arrivalTime > new Date(order.time_window.end) ? 100 : 0

      totalDistance += distance
      currentLocation = order.address
      currentTime = departureTime
    }

    route.total_distance_km = totalDistance
    route.total_duration_min = (currentTime.getTime() - new Date().getTime()) / 60000
    route.fuel_cost = totalDistance * vehicle.cost_per_km
    route.on_time_deliveries = route.stops.filter(stop => stop.late_penalty === 0).length
    route.efficiency_score = this.calculateRouteEfficiency(route)
  }

  private getBestSolution(population: VRPTWSolution[]): VRPTWSolution {
    return population.reduce((best, current) => 
      current.fitness_score > best.fitness_score ? current : best
    )
  }

  private cloneSolution(solution: VRPTWSolution): VRPTWSolution {
    return {
      ...solution,
      routes: solution.routes.map(route => this.cloneRoute(route)),
      objectives: { ...solution.objectives }
    }
  }

  private cloneRoute(route: VRPTWRoute): VRPTWRoute {
    return {
      ...route,
      stops: route.stops.map(stop => ({ ...stop }))
    }
  }
}