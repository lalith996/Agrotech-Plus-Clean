
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, OrderStatus } from "@prisma/client";

const formatOrderForEmail = (order: any) => {
  const itemsList = order.items.map((item: any) => 
    `<li>${item.product.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`
  ).join('');
  return `
    <h1>Order Confirmation #${order.id}</h1>
    <p>Thank you for your order!</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
    <p><strong>Delivery Address:</strong> ${order.address.street}, ${order.address.city}</p>
    <h3>Items:</h3>
    <ul>${itemsList}</ul>
    <h3>Total: $${order.totalAmount.toFixed(2)}</h3>
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { page = "1", limit = "10" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      let orders;
      let totalOrders;

      if (session.user.role === UserRole.CUSTOMER) {
        const customer = await prisma.customer.findUnique({
          where: { userId: session.user.id },
        });
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }

        [orders, totalOrders] = await prisma.$transaction([
          prisma.order.findMany({
            where: { customerId: customer.id },
            include: {
              items: { include: { product: true } },
              address: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
          }),
          prisma.order.count({ where: { customerId: customer.id } }),
        ]);
      } else if (session.user.role === UserRole.FARMER) {
        const farmer = await prisma.farmer.findUnique({
          where: { userId: session.user.id },
        });
        if (!farmer) {
          return res.status(404).json({ message: "Farmer profile not found" });
        }

        [orders, totalOrders] = await prisma.$transaction([
          prisma.order.findMany({
            where: {
              items: {
                some: {
                  product: {
                    farmerId: farmer.id,
                  },
                },
              },
            },
            include: {
              items: {
                where: { product: { farmerId: farmer.id } },
                include: { product: true },
              },
              customer: { include: { user: { select: { name: true, email: true } } } },
              address: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
          }),
          prisma.order.count({
            where: {
              items: {
                some: {
                  product: {
                    farmerId: farmer.id,
                  },
                },
              },
            },
          }),
        ]);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.status(200).json({
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalOrders,
          pages: Math.ceil(totalOrders / limitNum),
        },
      });
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      if (session.user.role !== UserRole.CUSTOMER) {
        return res.status(403).json({ message: "Only customers can create orders" });
      }

      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });

      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      // Validate order data
      const { items, addressId, deliverySlot, deliveryDate, specialNotes } = req.body;

      if (!items?.length) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }

      // Calculate total amount and validate products
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }

        if (!product.isActive) {
          return res.status(400).json({ message: `Product ${product.name} is not available` });
        }

        const itemTotal = product.basePrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.basePrice,
        });
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          addressId,
          deliverySlot,
          deliveryDate: new Date(deliveryDate),
          specialNotes,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          customer: {
            include: {
              user: true,
            },
          },
        },
      });

      // External notification services removed (SendGrid, Twilio)
      // Order confirmation stored in database
      console.log('[Order Created] Confirmation for:', {
        orderId: order.id,
        customerEmail: order.customer.user.email,
        customerPhone: order.customer.phone,
        totalAmount: order.totalAmount
      })

      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}
