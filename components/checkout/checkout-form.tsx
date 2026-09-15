import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

const CheckoutForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Simplified checkout without Stripe integration
      // In a real implementation, you would process the payment here
      console.log('[Checkout] Processing order:', {
        email,
        phone,
        amount: 1000
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Order placed successfully! (Payment processing disabled in clean version)');
      
      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        router.push('/order-confirmation');
      }, 2000);
    } catch (error) {
      console.error('[Checkout Error]', error);
      setMessage('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        required
      />
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
        Note: Payment processing is disabled in this clean version. 
        Orders will be logged to console.
      </p>
    </form>
  );
};

export default CheckoutForm;