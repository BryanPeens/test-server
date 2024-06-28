require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const morgan = require('morgan');

// Use morgan to log requests
app.use(morgan('combined'));

app.use(express.json());

// CORS setup to allow requests from both development and production URLs
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_PROD]
}));

// Log CORS setup
console.log('CORS setup to allow requests from:', process.env.CLIENT_URL, 'and', process.env.CLIENT_URL_PROD);

// Handle POST requests to create a checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { lineItems } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';

  const successUrl = isProduction ? `${process.env.CLIENT_URL_PROD}/success` : `${process.env.CLIENT_URL}/success`;
  const cancelUrl = isProduction ? `${process.env.CLIENT_URL_PROD}/cancel` : `${process.env.CLIENT_URL}/cancel`;

  // Log the received request body
  console.log('Received create-checkout-session request:', req.body);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Log the created session
    console.log('Checkout session created:', session);

    res.json({ id: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Set up your server to listen on a specific port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
