
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  isActive: boolean;
}

const FarmerProductsPage = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!session) return;
      try {
        const { data } = await axios.get('/api/products?availability=all');
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: newProduct } = await axios.post('/api/products', {
        name: newProductName,
        description: newProductDescription,
        basePrice: parseFloat(newProductPrice),
        category: newProductCategory,
      });

      setProducts([newProduct, ...products]);
      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice('');
      setNewProductCategory('');

    } catch (err) {
      setError('Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      const { data: updatedProduct } = await axios.put(`/api/products/${editingProduct.id}`, editingProduct);
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        setError('Failed to delete product.');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Products</h1>

      {/* Add/Edit Form */}
      <div style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={editingProduct ? handleUpdate : handleSubmit}>
          <input type="text" placeholder="Product Name" value={editingProduct ? editingProduct.name : newProductName} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProductName(e.target.value)} required />
          <textarea placeholder="Description" value={editingProduct ? editingProduct.description : newProductDescription} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProductDescription(e.target.value)} required />
          <input type="number" placeholder="Price" value={editingProduct ? editingProduct.basePrice : newProductPrice} onChange={e => editingProduct ? setEditingProduct({...editingProduct, basePrice: parseFloat(e.target.value)}) : setNewProductPrice(e.target.value)} required />
          <input type="text" placeholder="Category" value={editingProduct ? editingProduct.category : newProductCategory} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProductCategory(e.target.value)} required />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
          </button>
          {editingProduct && <button onClick={() => setEditingProduct(null)}>Cancel</button>}
        </form>
      </div>

      {/* Product List */}
      <h2>Existing Products</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && products.length === 0 && <p>You have not added any products yet.</p>}

      <div>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.basePrice.toFixed(2)}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Status:</strong> {product.isActive ? 'Active' : 'Inactive'}</p>
            <button onClick={() => setEditingProduct(product)}>Edit</button>
            <button onClick={() => handleDelete(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerProductsPage;
