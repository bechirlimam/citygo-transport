
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Simple Pegasus SVG used as logo (inline)
function PegasusLogo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 48c0-8 8-16 16-16h8l8-8 12-4-4 12-6 6a16 16 0 01-4 10H24c-8 0-16 0-16-0z" fill="#0f172a" />
      <path d="M46 16c-2 2-6 2-10 4s-8 6-8 6l2 4 8-4 8-8 0-2z" fill="#0ea5a4" />
    </svg>
  );
}

// Helper: Haversine distance in kilometers
function haversine([lat1, lon1], [lat2, lon2]) {
  function toRad(v) { return (v * Math.PI) / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function CityGoSite() {
  const company = { name: "CityGo Transport", owner: "Bechir LIMAM", address: "2 ter boulevard du docteur Pontier, 81300 Graulhet" };

  // Pricing
  const [pricePerKm, setPricePerKm] = useState(1.50);
  const nightRate = 2.00;
  const approachRate = 0.40;
  const minimumFare = 15;
  const fixedTariffs = [
    { route: "Aéroport Toulouse-Blagnac", price: 60 },
    { route: "Gare de Toulouse-Matabiau", price: 45 },
    { route: "Aéroport Castres-Mazamet", price: 80 },
  ];

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoord, setPickupCoord] = useState(null);
  const [dropoffCoord, setDropoffCoord] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [message, setMessage] = useState(null);

  async function geocode(address) {
    if (!address) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "CityGoTransport/1.0" } });
      const data = await res.json();
      if (data && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (e) { console.error(e); }
    return null;
  }

  async function handleEstimate(e) {
    e && e.preventDefault();
    setMessage(null);
    setLoadingGeo(true);
    const p = await geocode(pickup || company.address);
    const d = await geocode(dropoff);
    setPickupCoord(p);
    setDropoffCoord(d);
    if (!d) { setMessage('Destination introuvable.'); setDistanceKm(null); setEstimatedFare(null); setLoadingGeo(false); return; }
    const km = haversine(p || [0,0], d);
    setDistanceKm(km);

    // fixed tariff match
    const fixed = fixedTariffs.find(t => dropoff.toLowerCase().includes(t.route.split(' ')[0].toLowerCase()));
    let fare;
    if (fixed) {
      fare = fixed.price;
    } else {
      const hour = new Date().getHours();
      const rate = hour >= 22 || hour < 6 ? nightRate : pricePerKm;
      fare = km * rate + km * approachRate;
      if (fare < minimumFare) fare = minimumFare;
      fare = Math.round(fare * 100) / 100;
    }
    setEstimatedFare(fare);
    setLoadingGeo(false);
  }

  function handlePaySumUp() {
    window.open('https://pay.sumup.com/b2c/QJE57C27','_blank');
  }
  function handlePayPayPal() {
    window.open('https://www.paypal.com/paypalme/u7871963674','_blank');
  }

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div style={{padding:20}}>
      <header style={{display:'flex',alignItems:'center',gap:12}}>
        <PegasusLogo size={48} />
        <div>
          <h1 style={{margin:0}}>{company.name}</h1>
          <div style={{fontSize:12,color:'#6b7280'}}>{company.address}</div>
        </div>
      </header>

      <main style={{display:'flex',gap:24,marginTop:20}}>
        <section style={{flex:1,background:'#fff',padding:16,borderRadius:12}}>
          <h2>Réserver un trajet</h2>
          <div style={{marginTop:8}}>
            <label>Prise en charge</label>
            <input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder={company.address} style={{width:'100%',padding:8,marginTop:6}} />
          </div>
          <div style={{marginTop:8}}>
            <label>Destination</label>
            <input value={dropoff} onChange={e=>setDropoff(e.target.value)} placeholder="Adresse, gare ou aéroport" style={{width:'100%',padding:8,marginTop:6}} />
          </div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <input type="number" step="0.01" value={pricePerKm} onChange={e=>setPricePerKm(parseFloat(e.target.value||0))} style={{width:120,padding:8}} />
            <button onClick={handleEstimate} style={{padding:'8px 12px'}}>Estimer</button>
          </div>
          {message && <div style={{color:'red'}}>{message}</div>}
          <div style={{background:'#f1f5f9',padding:10,marginTop:10,borderRadius:8}}>
            <div>Distance estimée: <strong>{distanceKm? distanceKm.toFixed(2)+' km' : '—'}</strong></div>
            <div>Tarif estimé: <strong>{estimatedFare? estimatedFare+' €' : '—'}</strong></div>
          </div>

          <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:8}}>
            <button onClick={handlePaySumUp} style={{background:'#6366f1',color:'#fff',padding:10,borderRadius:8}}>Payer avec SumUp</button>
            <button onClick={handlePayPayPal} style={{background:'#0ea5e9',color:'#fff',padding:10,borderRadius:8}}>Payer avec PayPal</button>
          </div>
        </section>

        <aside style={{width:420,display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'#fff',padding:12,borderRadius:12}}>
            <h3>Carte</h3>
            <div style={{height:260,borderRadius:8,overflow:'hidden'}}>
              <MapContainer center={[43.521,2.117]} zoom={12} style={{height:'100%',width:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pickupCoord && <Marker position={pickupCoord}><Popup>Prise en charge</Popup></Marker>}
                {dropoffCoord && <Marker position={dropoffCoord}><Popup>Destination</Popup></Marker>}
              </MapContainer>
            </div>
          </div>

          <div style={{background:'#fff',padding:12,borderRadius:12}}>
            <h3>Tarifs fixes</h3>
            <table style={{width:'100%'}}>
              <thead><tr><th>Trajet</th><th>Prix</th></tr></thead>
              <tbody>
                {fixedTariffs.map(t=>(
                  <tr key={t.route}><td>{t.route}</td><td>{t.price} €</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </main>
    </div>
  );
}
