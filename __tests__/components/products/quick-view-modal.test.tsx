import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickViewModal } from '@/components/products/quick-view-modal';
import { useRouter } from 'next/navigation';

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 10.99,
  basePrice: 10.99,
  quantity: 100,
  unit: 'kg',
  images: ['test-image-1.jpg', 'test-image-2.jpg'],
  category: 'VEGETABLES',
  rating: 4.5,
  numReviews: 10,
  isActive: true,
  farmer: {
    farmName: 'Green Fields',
    location: 'Springfield',
    user: { name: 'Test Farmer' },
  },
}
// Mock functions
const mockClose = jest.fn();
const mockAddToCart = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/stores/cart-store', () => ({
  useCartStore: jest.fn((selector) => {
    const store = {
      items: [],
      addItem: mockAddToCart,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getItemCount: jest.fn(() => 0),
      getTotal: jest.fn(() => 0),
    };
    return selector ? selector(store) : store;
  }),
  useCart: jest.fn(),
}));

describe('QuickViewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product details correctly', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText(/10\.99/)).toBeInTheDocument();
  });

  it('handles quantity changes', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    const incrementButton = screen.getByLabelText('Increase quantity');
    const decrementButton = screen.getByLabelText('Decrease quantity');
    const quantityDisplay = screen.getByText('1');

    expect(quantityDisplay).toBeInTheDocument();
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);
  });

  it('adds product to cart', async () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('navigates to product detail page', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    const viewDetailsLink = screen.getByRole('link', { name: /view full details/i });
    expect(viewDetailsLink).toHaveAttribute('href', `/products/${mockProduct.id}`);
  });

  it('shows farmer information', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    // Verify farm name and location are displayed
    expect(screen.getByText(mockProduct.farmer.farmName)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.farmer.location)).toBeInTheDocument();
  });


  it('closes modal when close button is clicked', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    const closeButton = screen.getByLabelText('Close quick view');
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it('handles image gallery navigation', () => {
    render(<QuickViewModal product={mockProduct} isOpen={true} onClose={mockClose} />);

    const image2Button = screen.getByLabelText('Select image 2');
    const image1Button = screen.getByLabelText('Select image 1');

    fireEvent.click(image2Button);
    fireEvent.click(image1Button);
    
    expect(image1Button).toBeInTheDocument();
    expect(image2Button).toBeInTheDocument();
  });

  it('renders inactive product correctly', () => {
    const inactiveProduct = { ...mockProduct, isActive: false };
    render(<QuickViewModal product={inactiveProduct} isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(inactiveProduct.name)).toBeInTheDocument();
  });
});