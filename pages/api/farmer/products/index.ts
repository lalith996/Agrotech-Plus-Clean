import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'FARMER') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const farmer = await prisma.farmer.findUnique({ where: { userId: session.user.id } });
  if (!farmer) {
    return res.status(404).json({ message: 'Farmer not found' });
  }

  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({ where: { farmerId: farmer.id } });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, category, description, basePrice, unit } = req.body;
      const newProduct = await prisma.product.create({
        data: {
          name,
          category,
          description,
          basePrice,
          unit,
          images: [], // Add a default value for images
          farmer: { connect: { id: farmer.id } },
        },
      });
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
