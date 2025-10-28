import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductList } from '@/components/products/product-list';
import { useCart } from '@/lib/stores/cart-store';
import { useRouter } from 'next/navigation';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Test Description 1',
    price: 10.99,
    quantity: 100,
    unit: 'kg',
    images: ['test-image-1.jpg'],
    category: 'VEGETABLES',
    rating: 4.5,
    numReviews: 10,
    isActive: true,
    farmer: {
      id: '1',
      name: 'Test Farmer',
      email: 'test@example.com',
    },
  },
  {
    id: '2',
    name: 'Test Product 2',
    description: 'Test Description 2',
    price: 15.99,
    quantity: 50,
    unit: 'kg',
    images: ['test-image-2.jpg'],
    category: 'FRUITS',
    rating: 3.5,
    numReviews: 5,
    isActive: false,
    farmer: {
      id: '2',
      name: 'Test Farmer 2',
      email: 'test2@example.com',
    },
  },
];

// Mock functions
const mockAddToCart = jest.fn();
const mockPush = jest.fn();
const mockOpenQuickView = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/stores/cart-store', () => ({
  useCart: jest.fn(),
}));

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
    });
  });

  it('renders loading state correctly', () => {
    render(<ProductList products={[]} isLoading={true} onOpenQuickView={mockOpenQuickView} />);
    expect(screen.getAllByTestId('product-skeleton')).toHaveLength(8);
  });

  it('renders error state correctly', () => {
    render(<ProductList products={[]} error="Failed to load products" onOpenQuickView={mockOpenQuickView} />);
    expect(screen.getByText('Failed to load products')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<ProductList products={[]} isLoading={false} onOpenQuickView={mockOpenQuickView} />);
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('renders product list correctly', () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
      expect(screen.getByText(`${product.quantity} ${product.unit} available`)).toBeInTheDocument();
    });
  });

  it('navigates to product detail page when clicked', () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    const productCard = screen.getByText(mockProducts[0].name).closest('div');
    fireEvent.click(screen.getByText(mockProducts[0].name));

    expect(mockPush).toHaveBeenCalledWith(`/products/${mockProducts[0].id}`);
  });

  it('adds product to cart when add to cart button is clicked', async () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    const addToCartButton = screen.getByLabelText(`Add ${mockProducts[0].name} to cart`);
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
    });
  });

  it('opens quick view modal when quick view button is clicked', () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    const quickViewButton = screen.getAllByRole('button', { name: /quick view/i })[0];
    fireEvent.click(quickViewButton);

    expect(mockOpenQuickView).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('disables add to cart button for inactive products', () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    const addToCartButton = screen.getByLabelText(`Add ${mockProducts[1].name} to cart`);
    expect(addToCartButton).toBeDisabled();
  });

  it('displays product ratings correctly', () => {
    render(<ProductList products={mockProducts} onOpenQuickView={mockOpenQuickView} />);

    mockProducts.forEach((product) => {
      expect(screen.getByText(`${product.rating}`)).toBeInTheDocument();
      expect(screen.getByText(`(${product.numReviews})`)).toBeInTheDocument();
    });
  });
});