import React, { useState } from "react";
function AddressInput({ label, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);

  const search = async (text) => {
    onChange(text);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <input
        type="text"
        placeholder={label}
        value={value}
        onChange={(e) => search(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      {/* LISTE DES SUGGESTIONS */}
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "45px",
            width: "100%",
            background: "white",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
            padding: "0",
            margin: "0",
            listStyle: "none",
            zIndex: 10,
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => {
                onSelect(s);
                setSuggestions([]);
              }}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CityGoSite() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [estimate, setEstimate] = useState("");

  // ---- Convertir une adresse en lat/lng ----
  const geocode = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  };

  // ---- ESTIMATION ----
  const getEstimate = async () => {
    if (!pickup || !dropoff) {
      setEstimate("Merci de remplir départ et arrivée.");
      return;
    }

    try {
      setEstimate("Localisation en cours...");

      const from = await geocode(pickup);
      const to = await geocode(dropoff);

      if (!from || !to) {
        setEstimate("Impossible de trouver une des adresses.");
        return;
      }

      setEstimate("Calcul du prix...");

      const response = await fetch("http://localhost:4000/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to })
      });

      const data = await response.json();

      if (!response.ok) {
        setEstimate("Erreur : " + data.error);
        return;
      }

      setEstimate(`Distance : ${data.distance} km — Prix : ${data.price} €`);
    } catch (err) {
      console.error(err);
      setEstimate("Erreur interne.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Estimation de trajet</h2>

      <AddressInput
  label="Adresse de départ"
  value={pickup}
  onChange={setPickup}
  onSelect={(place) => setPickup(place.display_name)}
/>

<AddressInput
  label="Adresse d'arrivée"
  value={dropoff}
  onChange={setDropoff}
  onSelect={(place) => setDropoff(place.display_name)}
/>
