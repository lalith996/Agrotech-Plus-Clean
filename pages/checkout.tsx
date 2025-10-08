import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import CheckoutForm from '../components/checkout/checkout-form';

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;