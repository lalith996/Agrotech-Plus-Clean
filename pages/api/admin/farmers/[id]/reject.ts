import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid farmer ID" });
  }

  const { reason } = req.body;

  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    // Fetch farmer with user details
    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    if (farmer.isApproved) {
      return res.status(400).json({ message: "Cannot reject an already approved farmer" });
    }

    // Update farmer approval status to ensure it remains false
    const updatedFarmer = await prisma.farmer.update({
      where: { id },
      data: { isApproved: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Email notification disabled - external API removed
    console.log('[Farmer Rejected] Notification logged for:', {
      farmerEmail: farmer.user.email,
      farmerName: farmer.user.name,
      farmName: farmer.farmName,
      rejectionReason: reason
    });

    res.status(200).json({
      message: "Farmer application rejected",
      farmer: updatedFarmer,
    });
  } catch (error) {
    console.error("Farmer rejection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
