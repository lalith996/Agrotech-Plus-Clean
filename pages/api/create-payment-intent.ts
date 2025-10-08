import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import sgMail from '../../lib/sendgrid';
import client from '../../lib/twilio';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { amount, userEmail, userPhone } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
      });

      // Send email notification
      const emailMsg = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: 'Payment Confirmation',
        text: `Your payment of $${amount / 100} was successful.`,
        html: `<strong>Your payment of $${amount / 100} was successful.</strong>`,
      };
      await sgMail.send(emailMsg);

      // Send SMS notification
      const smsMsg = {
        body: `Your payment of $${amount / 100} was successful.`,
        to: userPhone,
        from: process.env.TWILIO_PHONE_NUMBER!,
      };
      await client.messages.create(smsMsg);

      res.status(200).send(paymentIntent.client_secret);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};