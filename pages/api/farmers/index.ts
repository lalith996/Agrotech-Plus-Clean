import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { farmerSchema } from "@/lib/validations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { page = "1", limit = "10", search, location, rating } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {
        isApproved: true,
      };

      if (search) {
        where.OR = [
          { farmName: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
          { user: { name: { contains: search as string, mode: "insensitive" } } },
        ];
      }

      if (location) {
        where.location = { contains: location as string, mode: "insensitive" };
      }

      if (rating) {
        // averageRating is not a persisted field; ignore rating filter in GET
        // TODO: implement aggregate filter based on reviews when available
      }

      const [farmers, totalFarmers] = await prisma.$transaction([
        prisma.farmer.findMany({
          where,
          select: {
            id: true,
            farmName: true,
            location: true,
            description: true,
            // removed averageRating: true,
            certifications: {
              where: { isValidated: true },
              select: {
                id: true,
                issuingBody: true,
                issueDate: true,
                expiryDate: true,
              },
            },
            products: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                category: true,
                basePrice: true,
                unit: true,
              },
            },
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.farmer.count({ where }),
      ]);

      res.status(200).json({
        farmers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalFarmers,
          pages: Math.ceil(totalFarmers / limitNum),
        },
      });
    } catch (error) {
      console.error("Public farmers fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (session.user.role !== UserRole.FARMER) {
        return res.status(403).json({ message: "Only farmers can create farmer profiles" });
      }

      // Check if farmer profile already exists
      const existingFarmer = await prisma.farmer.findFirst({
        where: { userId: session.user.id },
      });

      if (existingFarmer) {
        return res.status(400).json({ message: "Farmer profile already exists" });
      }

      // Validate farmer data
      const validatedData = farmerSchema.parse(req.body);

      // Create farmer profile
      const farmer = await prisma.farmer.create({
        data: {
          ...validatedData,
          userId: session.user.id,
          isApproved: false, // Requires admin approval
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      res.status(201).json(farmer);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Farm name already exists" });
      }
      console.error("Farmer creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const farmer = await prisma.farmer.findFirst({
        where: { userId: session.user.id },
      });

      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      // Validate farmer data
      const validatedData = farmerSchema.parse(req.body);

      // Update farmer profile
      const updatedFarmer = await prisma.farmer.update({
        where: { id: farmer.id },
        data: validatedData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      res.status(200).json(updatedFarmer);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Farm name already exists" });
      }
      console.error("Farmer update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}
