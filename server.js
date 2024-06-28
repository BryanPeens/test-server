require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(express.json());

// CORS setup to allow requests from both development and production URLs
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_PROD]
}));

// Handle POST requests to create a checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { lineItems } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';

  const successUrl = isProduction ? `${process.env.CLIENT_URL_PROD}/success` : `${process.env.CLIENT_URL}/success`;
  const cancelUrl = isProduction ? `${process.env.CLIENT_URL_PROD}/cancel` : `${process.env.CLIENT_URL}/cancel`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

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
