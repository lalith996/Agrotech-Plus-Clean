import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { amount, userEmail, userPhone } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ statusCode: 500, message: 'Stripe is not configured.' });
      }

      // Dynamically import Stripe to avoid build-time module requirement
      const StripeModule: any = await import('stripe');
      const stripe: any = new StripeModule.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
      });

      // External notification services removed (SendGrid, Twilio)
      console.log('[Payment Success] Confirmation logged for:', {
        userEmail,
        userPhone,
        amount: amount / 100,
        paymentIntentId: paymentIntent.id
      });

      res.status(200).send(paymentIntent.client_secret);
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err?.message || 'Unknown error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};