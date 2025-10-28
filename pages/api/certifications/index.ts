
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

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
      const { page = "1", limit = "10", isValidated } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      let where: any = {};

      // For farmers, show only their certifications
      if (session.user.role === UserRole.FARMER) {
        const farmer = await prisma.farmer.findFirst({
          where: { userId: session.user.id },
        });
        if (!farmer) {
          return res.status(404).json({ message: "Farmer profile not found" });
        }
        where.farmerId = farmer.id;
      }
      // For admin/operations, show all certifications
      else if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Filter by validation status if specified
      if (isValidated !== undefined) {
        where.isValidated = isValidated === "true";
      }

      const [certifications, totalCount] = await prisma.$transaction([
        prisma.certification.findMany({
          where,
          include: {
            file: true,
            farmer: {
              select: {
                farmName: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.certification.count({ where }),
      ]);

      res.status(200).json({
        certifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      if (session.user.role !== UserRole.FARMER) {
        return res.status(403).json({ message: "Only farmers can upload certifications" });
      }

      const farmer = await prisma.farmer.findFirst({
        where: { userId: session.user.id },
      });

      if (!farmer) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      // Read required fields
      const { fileId, name, issuingBody, issueDate, expiryDate } = req.body as {
        fileId: string
        name: string
        issuingBody: string
        issueDate: string
        expiryDate?: string
      };

      if (!fileId || !name || !issuingBody || !issueDate) {
        return res.status(400).json({ message: "Missing required certification fields" });
      }

      // Verify file exists and is a PDF
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.mimeType !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files are allowed for certifications" });
      }

      // Extract text from PDF (fallback since extractor is unavailable)
      const extractedText = "";

      // Create certification with extracted text
      const certification = await prisma.certification.create({
        data: {
          farmerId: farmer.id,
          name,
          issuingBody,
          issueDate: new Date(issueDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          fileId: file.id,
          extractedText,
          isValidated: false,
        },
        include: {
          file: true,
          farmer: {
            select: {
              farmName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(certification);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid certification data", errors: error.errors });
      }
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OPERATIONS) {
        return res.status(403).json({ message: "Only admin/operations can validate certifications" });
      }

      const { id } = req.query;
      const { isValidated } = req.body as { isValidated: boolean };

      if (typeof id !== "string") {
        return res.status(400).json({ message: "Invalid certification ID" });
      }

      const certification = await prisma.certification.update({
        where: { id },
        data: {
          isValidated,
          validatedBy: session.user.id,
          validatedAt: new Date(),
        },
        include: {
          file: true,
          farmer: {
            select: {
              farmName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(certification);
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
