import React, { useState } from "react";

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

      <input
        type="text"
        placeholder="Adresse de départ"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Adresse d'arrivée"
        value={dropoff}
        onChange={(e) => setDropoff(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
      />

      <button
        onClick={getEstimate}
        style={{
          padding: "10px",
          background: "#444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Estimer le prix
      </button>

      {estimate && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          {estimate}
        </p>
      )}
    </div>
  );
}
