jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })),
}));

// Mock prisma from db-optimization to avoid real Prisma client and process hooks
jest.mock('@/lib/db-optimization', () => {
  const { prismaMock } = require('@/lib/__mocks__/prisma');
  return { prisma: prismaMock };
});

jest.mock('@/lib/search', () => ({
  SearchEngine: {
    isElasticsearchAvailable: jest.fn(() => Promise.resolve(false)),
  },
  PRODUCT_FILTERS: {},
}));

jest.mock('@/lib/cache', () => ({
  cacheHelpers: {
    cacheSearchResults: jest.fn((query, filters, fn) => fn()),
  },
}));

import { prismaMock } from '@/lib/__mocks__/prisma';
import handler from '@/pages/api/search/products';
import { Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

type MockProduct = Product & {
  farmer: {
    id: string;
    farmName: string;
    location: string;
    isApproved: boolean;
  };
};

describe('Product Search API', () => {
  const mockProducts: MockProduct[] = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      description: 'Organic tomatoes',
      basePrice: 2.99,
      unit: 'kg',
      images: ['tomato.jpg'],
      category: 'VEGETABLES',
      isActive: true,
      farmerId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      farmer: {
        id: '1',
        farmName: 'Green Farms',
        location: 'Local Area',
        isApproved: true
      }
    },
    {
      id: '2',
      name: 'Red Apples',
      description: 'Sweet red apples',
      basePrice: 3.99,
      unit: 'kg',
      images: ['apple.jpg'],
      category: 'FRUITS',
      isActive: true,
      farmerId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
      farmer: {
        id: '2',
        farmName: 'Apple Orchards',
        location: 'Hill Station',
        isApproved: true
      }
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns products with default pagination', async () => {
    prismaMock.product.findMany.mockResolvedValue(mockProducts);
    prismaMock.product.count.mockResolvedValue(2);

    const req = {
      method: 'GET',
      query: {},
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        items: expect.any(Array),
      })
    );
  });

  it('filters products by search query', async () => {
    prismaMock.product.findMany.mockResolvedValue([mockProducts[0]]);
    prismaMock.product.count.mockResolvedValue(1);

    const req = {
      method: 'GET',
      query: { query: 'tomato' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filters products by category', async () => {
    prismaMock.product.findMany.mockResolvedValue([mockProducts[1]]);
    prismaMock.product.count.mockResolvedValue(1);

    const req = {
      method: 'GET',
      query: { filters: JSON.stringify({ category: 'FRUITS' }) },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filters products by price range', async () => {
    prismaMock.product.findMany.mockResolvedValue([mockProducts[0]]);
    prismaMock.product.count.mockResolvedValue(1);

    const req = {
      method: 'GET',
      query: { filters: JSON.stringify({ price: { min: 2, max: 3 } }) },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('sorts products by price ascending', async () => {
    const sortedProducts = [...mockProducts].sort((a, b) => a.basePrice - b.basePrice);
    prismaMock.product.findMany.mockResolvedValue(sortedProducts);
    prismaMock.product.count.mockResolvedValue(2);

    const req = {
      method: 'GET',
      query: { sortBy: 'price', sortOrder: 'asc' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });



  it('handles pagination parameters', async () => {
    prismaMock.product.findMany.mockResolvedValue([mockProducts[1]]);
    prismaMock.product.count.mockResolvedValue(2);

    const req = {
      method: 'GET',
      query: { page: '2', limit: '1' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles invalid query parameters gracefully', async () => {
    const req = {
      method: 'GET',
      query: { page: 'invalid', limit: 'invalid' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles database errors', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('Database error'));

    const req = {
      method: 'GET',
      query: {},
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});