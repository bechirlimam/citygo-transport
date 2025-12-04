const express = require('express');
const router = express.Router();

// Tarifs fixes par km et frais min
const PRICE_PER_KM = 1.20;      // prix au km
const BASE_FARE = 2;            // frais de prise en charge
const MIN_PRICE = 7;            // prix minimum du trajet

// Calcul simple de distance (en km) basé sur lat/lng
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

router.post('/', (req, res) => {
    const { from, to } = req.body;

    if (!from || !to) {
        return res.status(400).json({ error: "Missing origin or destination" });
    }

    const distance = haversineDistance(
        from.lat,
        from.lng,
        to.lat,
        to.lng
    );

    let price = BASE_FARE + distance * PRICE_PER_KM;

    if (price < MIN_PRICE) price = MIN_PRICE;

    res.json({
        distance: distance.toFixed(2),
        price: price.toFixed(2)
    });
});

module.exports = router;

