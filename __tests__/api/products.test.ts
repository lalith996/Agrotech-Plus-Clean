// Mock next-auth before any imports to avoid ESM issues
jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  getSession: jest.fn(),
}));

import { createMocks } from 'node-mocks-http';
import { prismaMock } from '@/lib/__mocks__/prisma';
import { getServerSession } from 'next-auth/next';
import indexHandler from '@/pages/api/products/index';
import idHandler from '@/pages/api/products/[id]';

const mockGetServerSession = getServerSession as unknown as jest.Mock;

describe('Product API Endpoints', () => {
  const farmerIdCuid = 'c000000000000000000000001';
  const otherFarmerIdCuid = 'c000000000000000000000002';

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    basePrice: 10.99,
    unit: 'kg',
    images: ['https://example.com/test-image.jpg'],
    category: 'VEGETABLES',
    isActive: true,
    farmerId: farmerIdCuid,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: '1',
        role: 'FARMER',
      },
    });
    // Default farmer mock to match session user with valid CUID
    prismaMock.farmer.findUnique.mockResolvedValue({ id: farmerIdCuid, userId: '1' } as any);
  });

  describe('GET /api/products', () => {
    it('returns products list with default filters', async () => {
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);

      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await indexHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThanOrEqual(1);
      expect(data.products[0].id).toBe(mockProduct.id);
    });
  });

  describe('POST /api/products', () => {
    it('creates a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        basePrice: 15.99,
        unit: 'kg',
        images: ['https://example.com/new-image.jpg'],
        category: 'FRUITS',
      };

      prismaMock.product.create.mockResolvedValue({
        ...mockProduct,
        ...newProduct,
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: newProduct,
      });

      await indexHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toMatchObject(newProduct);
    });

    it('validates product data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
        basePrice: -10, // Invalid: negative price
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidProduct,
      });

      await indexHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('requires farmer role', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: {
          id: '1',
          role: 'USER',
        },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: mockProduct,
      });

      await indexHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('PUT /api/products/[id]', () => {
    it('updates product by id', async () => {
      const updates = {
        name: 'Updated Product',
        description: 'Updated Description',
        basePrice: 20.99,
        unit: 'kg',
        images: ['https://example.com/updated-image.jpg'],
        category: 'VEGETABLES',
        isActive: true,
        farmerId: farmerIdCuid,
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockResolvedValue({
        ...mockProduct,
        ...updates,
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: updates,
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject(updates);
    });

    it('validates update data', async () => {
      const invalidUpdates = {
        basePrice: -10, // Invalid: negative price
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: invalidUpdates,
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('verifies product ownership', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: {
          id: '2', // Different farmer
          role: 'FARMER',
        },
      });

      // Farmer is different from product.farmerId to trigger 403
      prismaMock.farmer.findUnique.mockResolvedValue({ id: otherFarmerIdCuid, userId: '2' } as any);
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: { name: 'Updated Product' },
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('deletes product by id', async () => {
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.delete.mockResolvedValue(mockProduct as any);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('verifies product ownership before deletion', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: {
          id: '2', // Different farmer
          role: 'FARMER',
        },
      });

      prismaMock.farmer.findUnique.mockResolvedValue({ id: otherFarmerIdCuid, userId: '2' } as any);
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('returns 404 when product not found', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await idHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });
});