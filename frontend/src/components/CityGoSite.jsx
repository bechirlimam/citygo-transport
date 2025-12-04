// ---- ESTIMATION TARIF ----
const getEstimate = async () => {
  if (!pickup || !dropoff) {
    setEstimate("Merci de remplir départ + arrivée.");
    return;
  }
<button 
  onClick={getEstimate}
  style={{
    padding: "10px",
    marginTop: "10px",
    background: "#444",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer"
  }}
>
  Estimer le prix
</button>

{estimate && (
  <p style={{ marginTop: "10px", fontWeight: "bold" }}>
    {estimate}
  </p>
)}

  try {
    setEstimate("Calcul en cours...");

    const resp = await fetch("https://citygo-transport.onrender.com/api/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pickup,
        dropoff,
        datetimeISO: new Date().toISOString()
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      setEstimate("Erreur : " + data.error);
      return;
    }

    setEstimate(`Prix estimé : ${data.breakdown.finalFare} €`);
  } catch (err) {
    console.error(err);
    setEstimate("Erreur interne.");
  }
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
<button 
  onClick={getEstimate}
  style={{
    padding: "10px",
    marginTop: "10px",
    background: "#444",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer"
  }}
>
  Estimer le prix
</button>

{estimate && (
  <p style={{ marginTop: "10px", fontWeight: "bold" }}>
    {estimate}
  </p>
)}

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
