const express = require('express');
const router = express.Router();
const { createInvoicePDF } = require('../lib/invoice');

// In-memory store for demo
const reservations = [];

router.post('/', async (req, res) => {
  const data = req.body;
  data.id = `res_${Date.now()}`;
  data.status = 'pending_payment';
  reservations.push(data);

  // generate simple invoice PDF (demo)
  try {
    const filename = await createInvoicePDF(data);
    console.log('Invoice generated at', filename);
  } catch (e) { console.warn('Invoice error', e); }

  res.json({ reservation: data, payment: { sumup: process.env.SUMUP_PUBLIC_LINK } });
});

module.exports = router;
