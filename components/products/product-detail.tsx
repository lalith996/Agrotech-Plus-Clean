import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/stores/cart-store';
import type { Product } from '@prisma/client';

type ProductDetailProps = {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
};

export function ProductDetail({ product, isLoading, error }: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const minQ = 1;
  const maxQ = 100;

  const [quantity, setQuantity] = useState<number>(minQ);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (isLoading) {
    return <div data-testid="product-detail-loading">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return null;
  }

  const gallery = product.images || [];
  const currentImage = gallery.length > 0 ? gallery[currentIndex] : '';

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setQuantity(minQ);
      return;
    }
    const clamped = Math.min(Math.max(parsed, minQ), maxQ);
    setQuantity(clamped);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const gotoFarmer = () => {
    router.push(`/farmers/${product.farmerId}`);
  };

  const nextImage = () => {
    if (gallery.length === 0) return;
    setCurrentIndex((i) => Math.min(i + 1, gallery.length - 1));
  };

  const prevImage = () => {
    if (gallery.length === 0) return;
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div>
      {!product.isActive && <div>Product Unavailable</div>}

      <h1>{product.name}</h1>
      <p>{product.description || ''}</p>
      <div>
        <span>${product.basePrice}</span>
        <span>/{product.unit}</span>
      </div>

      {/* Use an img for test compatibility */}
      <img src={currentImage} alt={product.name} />

      <div>
        <button data-testid="gallery-prev" onClick={prevImage}>Prev</button>
        <button data-testid="gallery-next" onClick={nextImage}>Next</button>
      </div>

      <div>
        <input
          type="number"
          aria-label="Quantity"
          value={quantity}
          onChange={handleQuantityChange}
        />
      </div>

      <div>
        <button onClick={handleAddToCart} disabled={!product.isActive}>Add to Cart</button>
      </div>

      <div>
        <button onClick={gotoFarmer}>View Farmer Profile</button>
      </div>
    </div>
  );
}