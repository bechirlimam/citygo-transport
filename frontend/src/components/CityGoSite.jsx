const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// TARIFS
const DAY_RATE = 1.50;
const NIGHT_RATE = 2.00;
const MINIMUM_FARE = 15;
const APPROACH_RATE = 0.40; // optionnel
const UBER_DISCOUNT = 4;    // réduction style Uber

function isNight(dateString) {
  const hour = new Date(dateString).getHours();
  return hour >= 21 || hour < 6;
}

router.post("/", async (req, res) => {
  const { pickup, dropoff, date } = req.body;

  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "Pickup and dropoff required" });
  }

  try {
    // 1) Geocodage
    const geo = async addr => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`;
      const r = await fetch(url);
      const d = await r.json();
      return d[0] ? [parseFloat(d[0].lon), parseFloat(d[0].lat)] : null;
    };

    const start = await geo(pickup);
    const end = await geo(dropoff);

    if (!start || !end) {
      return res.json({ error: "Adresse introuvable" });
    }

    // 2) Route GPS (OpenRouteService)
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.ORS_KEY}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: [start, end] })
    });

    const route = await r.json();
    if (!route.features) {
      return res.json({ error: "Erreur de calcul GPS" });
    }

    const distanceMeters = route.features[0].properties.summary.distance;
    const km = distanceMeters / 1000;

    // 3) Tarif jour/nuit
    const rate = isNight(date) ? NIGHT_RATE : DAY_RATE;

    let fare = km * rate + km * APPROACH_RATE;

    // réduction façon Uber
    fare -= UBER_DISCOUNT;

    if (fare < MINIMUM_FARE) fare = MINIMUM_FARE;

    fare = Math.round(fare * 100) / 100;

    res.json({
      distance_km: km.toFixed(2),
      fare
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
