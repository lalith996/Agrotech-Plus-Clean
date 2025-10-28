import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mlClient, mlFallbacks } from '@/lib/ml-client';
import { UserRole } from '@prisma/client';

/**
 * Route Optimization API Endpoint
 * 
 * Optimizes delivery routes using ML service or fallback algorithm.
 * Considers delivery time windows and vehicle capacity.
 */

interface OptimizeRouteRequest {
  routeId?: string;
  slotId?: string;
  date?: string;
  orderIds?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authentication check
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'You must be logged in to access this endpoint'
    });
  }

  // Authorization check - only ADMIN and OPERATIONS can optimize routes
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You do not have permission to optimize routes'
    });
  }

  if (req.method === 'POST') {
    try {
      const { routeId, slotId, date, orderIds } = req.body as OptimizeRouteRequest;

      // Validate input
      if (!routeId && !slotId && !orderIds) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Either routeId, slotId, or orderIds must be provided'
        });
      }

      let route;
      let orders;

      // Fetch route and orders based on input
      if (routeId) {
        // Optimize existing route
        route = await prisma.deliveryRoute.findUnique({
          where: { id: routeId },
          include: {
            slot: {
              include: {
                zone: true
              }
            },
            routeOrders: {
              include: {
                order: {
                  include: {
                    address: true,
                    items: {
                      include: {
                        product: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!route) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Route not found'
          });
        }

        orders = route.routeOrders.map(ro => ro.order);
      } else if (slotId && date) {
        // Create new route for slot and date
        const slot = await prisma.deliverySlot.findUnique({
          where: { id: slotId },
          include: {
            zone: true
          }
        });

        if (!slot) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Delivery slot not found'
          });
        }

        // Find orders for this slot and date
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        orders = await prisma.order.findMany({
          where: {
            deliveryDate: {
              gte: startOfDay,
              lt: endOfDay
            },
            status: {
              in: ['CONFIRMED', 'PICKED']
            }
          },
          include: {
            address: true,
            items: {
              include: {
                product: true
              }
            }
          }
        });

        // Create route if it doesn't exist
        route = await prisma.deliveryRoute.create({
          data: {
            slotId,
            date: targetDate,
            status: 'planned',
            optimizedOrder: []
          },
          include: {
            slot: {
              include: {
                zone: true
              }
            }
          }
        });
      } else if (orderIds && orderIds.length > 0) {
        // Optimize specific orders
        orders = await prisma.order.findMany({
          where: {
            id: {
              in: orderIds
            }
          },
          include: {
            address: true,
            items: {
              include: {
                product: true
              }
            }
          }
        });

        if (orders.length === 0) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'No orders found with provided IDs'
          });
        }
      } else {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request parameters'
        });
      }

      // Filter orders with valid addresses
      const validOrders = orders.filter(order => 
        order.address.latitude !== null && 
        order.address.longitude !== null
      );

      if (validOrders.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No orders with valid addresses found'
        });
      }

      // Prepare data for ML service
      const mlRequest = {
        orders: validOrders.map(order => ({
          id: order.id,
          address: {
            lat: order.address.latitude!,
            lng: order.address.longitude!
          },
          timeWindow: order.deliverySlot ? {
            start: order.deliverySlot.split('-')[0]?.trim() || '09:00',
            end: order.deliverySlot.split('-')[1]?.trim() || '18:00'
          } : undefined
        })),
        constraints: {
          maxStops: 50,
          maxDuration: 480 // 8 hours in minutes
        }
      };

      // Call ML service with fallback
      const mlResponse = await mlClient.optimizeRoute(
        mlRequest,
        async () => mlFallbacks.nearestNeighbor(mlRequest.orders)
      );

      if (!mlResponse.success || !mlResponse.data) {
        return res.status(500).json({
          error: 'Optimization Failed',
          message: mlResponse.error || 'Failed to optimize route'
        });
      }

      const optimizationResult = mlResponse.data;

      // Update route with optimized sequence if route exists
      if (route) {
        await prisma.deliveryRoute.update({
          where: { id: route.id },
          data: {
            optimizedOrder: optimizationResult.optimizedSequence,
            estimatedDuration: optimizationResult.estimatedDuration,
            status: 'planned'
          }
        });

        // Create or update RouteOrder entries with sequence
        for (let i = 0; i < optimizationResult.optimizedSequence.length; i++) {
          const orderId = optimizationResult.optimizedSequence[i];
          
          await prisma.routeOrder.upsert({
            where: {
              routeId_orderId: {
                routeId: route.id,
                orderId
              }
            },
            create: {
              routeId: route.id,
              orderId,
              sequence: i + 1
            },
            update: {
              sequence: i + 1
            }
          });
        }

        // Save optimization results to database
        await prisma.routeOptimization.upsert({
          where: { routeId: route.id },
          create: {
            routeId: route.id,
            algorithm: mlResponse.fallback ? 'nearest_neighbor' : 'ml_optimization',
            parameters: {},
            originalDistance: optimizationResult.originalDistance,
            optimizedDistance: optimizationResult.optimizedDistance,
            originalDuration: Math.round(optimizationResult.estimatedDuration * 1.2), // Estimate original as 20% longer
            optimizedDuration: optimizationResult.estimatedDuration,
            savings: optimizationResult.savings
          },
          update: {
            algorithm: mlResponse.fallback ? 'nearest_neighbor' : 'ml_optimization',
            parameters: {},
            originalDistance: optimizationResult.originalDistance,
            optimizedDistance: optimizationResult.optimizedDistance,
            originalDuration: Math.round(optimizationResult.estimatedDuration * 1.2),
            optimizedDuration: optimizationResult.estimatedDuration,
            savings: optimizationResult.savings
          }
        });
      }

      // Return optimization results
      return res.status(200).json({
        success: true,
        routeId: route?.id || optimizationResult.routeId,
        optimizedSequence: optimizationResult.optimizedSequence,
        originalDistance: optimizationResult.originalDistance,
        optimizedDistance: optimizationResult.optimizedDistance,
        savings: optimizationResult.savings,
        estimatedDuration: optimizationResult.estimatedDuration,
        algorithm: mlResponse.fallback ? 'nearest_neighbor' : 'ml_optimization',
        fallback: mlResponse.fallback || false,
        orderCount: validOrders.length
      });

    } catch (error) {
      console.error('Route optimization error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  } else {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST method is supported'
    });
  }
}
