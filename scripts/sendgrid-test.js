// Standalone SendGrid test script
// Loads env from .env.local, then sends minimal sample email

require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error('Missing SENDGRID_API_KEY in environment');
  process.exit(1);
}

sgMail.setApiKey(apiKey);

// Optional EU data residency toggle via env
if (process.env.SENDGRID_DATA_RESIDENCY === 'eu') {
  try {
    sgMail.setDataResidency('eu');
    console.log('Using EU data residency');
  } catch (e) {
    console.warn('Failed to set EU data residency:', e?.message);
  }
}

const to = process.env.SENDGRID_TEST_TO || 'test@example.com';
const from = process.env.SENDGRID_FROM_EMAIL || 'test@example.com';

const msg = {
  to,
  from,
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sgMail
  .send(msg)
  .then((responses) => {
    const res = Array.isArray(responses) ? responses[0] : responses;
    console.log('Email sent', { statusCode: res?.statusCode });
    process.exit(0);
  })
  .catch((error) => {
    const body = error?.response?.body;
    console.error('SendGrid error:', body || error);
    process.exit(1);
  });