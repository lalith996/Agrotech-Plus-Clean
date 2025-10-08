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

  const { id } = req.query;

  // Find the product and ensure it belongs to the farmer
  const product = await prisma.product.findFirst({
    where: { id: String(id), farmerId: farmer.id },
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found or you do not have permission to modify it' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, category, description, basePrice, unit } = req.body;
      const updatedProduct = await prisma.product.update({
        where: { id: String(id) },
        data: { name, category, description, basePrice, unit },
      });
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.product.delete({ where: { id: String(id) } });
      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
