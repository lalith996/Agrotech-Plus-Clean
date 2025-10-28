import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductDetail } from '../../../components/products/product-detail';
import { useCart } from '@/lib/stores/cart-store';
import { Product } from '@prisma/client';

jest.mock('@/lib/stores/cart-store');
const mockUseCart = useCart as jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProductDetail Component', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    basePrice: 10.99,
    images: ['/test.jpg'],
    farmerId: '1',
    category: '1',
    unit: 'kg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Product;

  const mockAddToCart = jest.fn();

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      addToCart: mockAddToCart,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders product details correctly', () => {
    render(<ProductDetail product={mockProduct} isLoading={false} error={null} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description!)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.basePrice}`)).toBeInTheDocument();
    expect(screen.getByText(`/${mockProduct.unit}`)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockProduct.images[0]);
  });

  it('displays loading state', () => {
    render(<ProductDetail product={null} isLoading={true} error={null} />);

    expect(screen.getByTestId('product-detail-loading')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const error = 'Failed to load product';
    render(<ProductDetail product={null} isLoading={false} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('handles quantity changes correctly', () => {
    render(<ProductDetail product={mockProduct} isLoading={false} error={null} />);

    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    expect(quantityInput).toHaveValue(5);

    // Test min quantity
    fireEvent.change(quantityInput, { target: { value: '0' } });
    expect(quantityInput).toHaveValue(1);

    // Test max quantity
    fireEvent.change(quantityInput, { target: { value: '200' } });
    expect(quantityInput).toHaveValue(100);
  });

  it('adds product to cart correctly', async () => {
    render(<ProductDetail product={mockProduct} isLoading={false} error={null} />);

    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 3);
    });
  });

  it('navigates to farmer profile', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    render(<ProductDetail product={mockProduct} isLoading={false} error={null} />);

    const farmerLink = screen.getByText('View Farmer Profile');
    fireEvent.click(farmerLink);

    expect(mockPush).toHaveBeenCalledWith(`/farmers/${mockProduct.farmerId}`);
  });

  it('handles image gallery navigation', () => {
    const productWithGallery = {
      ...mockProduct,
      images: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],
    } as unknown as Product;

    render(
      <ProductDetail
        product={productWithGallery}
        isLoading={false}
        error={null}
      />
    );

    const nextButton = screen.getByTestId('gallery-next');
    const prevButton = screen.getByTestId('gallery-prev');

    fireEvent.click(nextButton);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/image2.jpg');

    fireEvent.click(prevButton);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/image1.jpg');
  });

  it('handles inactive products correctly', () => {
    const inactiveProduct = { ...mockProduct, isActive: false } as unknown as Product;
    render(
      <ProductDetail product={inactiveProduct} isLoading={false} error={null} />
    );

    expect(screen.getByText('Product Unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });
});