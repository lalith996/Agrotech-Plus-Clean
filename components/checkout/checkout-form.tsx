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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium block mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium block mb-1">
          Phone number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className="w-full border rounded p-2"
        />
      </div>
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#00B207] text-white hover:bg-[#00B207]/90 h-9 px-4 py-2 mt-2">
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : 'Place Order'}
      </button>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
        Note: Payment processing is disabled in this clean version. 
        Orders will be logged to console.
      </p>
    </form>
  );
};

export default CheckoutForm;