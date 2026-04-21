// routes/payments.js
const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Initialize Paystack payment
router.post('/paystack/initialize', protect, async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'annual'
  const amount = plan === 'annual' ? 20000 * 100 : 2500 * 100; // in kobo/pesewas
  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: req.user.email, amount,
      metadata: { userId: req.user._id.toString(), plan },
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      channels: ['card', 'mobile_money', 'bank']
    }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
    res.json({ success: true, authorizationUrl: response.data.data.authorization_url, reference: response.data.data.reference });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

// Verify Paystack payment
router.post('/paystack/verify', protect, async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
    if (response.data.data.status === 'success') {
      const plan = response.data.data.metadata?.plan || 'monthly';
      const expiry = new Date();
      if (plan === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
      else expiry.setMonth(expiry.getMonth() + 1);
      await User.findByIdAndUpdate(req.user._id, { plan, paymentRef: reference, paymentExpiry: expiry });
      res.json({ success: true, message: 'Payment verified', plan });
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Paystack webhook
router.post('/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(400).send('Invalid signature');
  const event = JSON.parse(req.body);
  console.log(`🔔 [Webhook] Received Paystack event: ${event.event}`);

  if (event.event === 'charge.success') {
    const { metadata, customer, reference } = event.data;
    try {
      const user = await User.findById(metadata.userId) || await User.findOne({ email: customer.email });
      
      if (user) {
        const expiry = new Date();
        const plan = metadata.plan || 'monthly';
        if (plan === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
        else expiry.setMonth(expiry.getMonth() + 1);

        await User.findByIdAndUpdate(user._id, { 
          plan, 
          paymentExpiry: expiry,
          paymentRef: reference 
        });
        console.log(`✅ [Webhook] User ${user.email} successfully upgraded to ${plan} via webhook.`);
      } else {
        console.warn(`⚠️ [Webhook] Success event received but user not found: ${customer.email}`);
      }
    } catch (err) {
      console.error('🔥 [Webhook] Error processing charge.success:', err.message);
      return res.status(500).send('Webhook processing failed');
    }
  }
  res.sendStatus(200);
});

module.exports = router;
