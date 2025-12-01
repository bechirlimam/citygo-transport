const express = require('express');
const router = express.Router();

// Demo endpoints: implement real provider SDKs in production

router.post('/sumup', async (req, res) => {
  const { amount } = req.body;
  return res.json({ payment_url: process.env.SUMUP_PUBLIC_LINK || 'https://pay.sumup.com/b2c/QJE57C27' });
});

router.post('/paypal', async (req, res) => {
  const { amount } = req.body;
  return res.json({ payment_url: `https://www.paypal.com/paypalme/u7871963674/${amount}` });
});

router.post('/webhook', async (req, res) => {
  console.log('Payment webhook received', req.body);
  res.status(200).send('ok');
});

module.exports = router;
