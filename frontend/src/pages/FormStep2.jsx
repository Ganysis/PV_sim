import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, TextField, LinearProgress, useMediaQuery } from "@mui/material";
import logo from "../assets/egsl.png";
import SidebarBanner from "../components/Sidebanner";
const ELECTRICITY_PRICE_PER_KWH = 0.2016; // Prix de l'électricité €/kWh

const FormStep2 = ({ onNext }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [sessionId, setSessionId] = useState("");
  const [consumptionKwh, setConsumptionKwh] = useState("");
  const [consumptionEuro, setConsumptionEuro] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      setError("Session invalide, veuillez recommencer.");
    }
  }, []);

  const handleSubmit = async () => {
    if (!consumptionKwh && !consumptionEuro) {
      setError("Veuillez renseigner au moins une des deux valeurs.");
      return;
    }

    setLoading(true);
    setError("");

    let electricity = consumptionKwh ? parseFloat(consumptionKwh) : parseFloat(consumptionEuro) / ELECTRICITY_PRICE_PER_KWH;

    try {
      const response = await fetch("http://localhost:5000/api/users/consumption", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, electricity })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Données mises à jour :", data);
        onNext(); // Passer à l'étape suivante
      } else {
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch (err) {
      console.error("❌ Erreur d'envoi :", err);
      setError("Une erreur est survenue lors de l'envoi des données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", paddingX: isMobile ? 2 : 5 }}>
      {/* Section Formulaire */}
      <Box
        sx={{
          width: isMobile ? "100%" : "66%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          backgroundColor: "#FFFFFF",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        {/* Logo centré */}
        <Box mb={3}>
          <img src={logo} alt="EGSL Logo" style={{ height: 60 }} />
        </Box>

        {/* Barre de progression */}
        <LinearProgress variant="determinate" value={40} sx={{ width: "100%", my: 2 }} />

        {/* Question */}
        <Typography variant="h6" fontWeight="bold" gutterBottom color="black">
          Question 2/4
        </Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="black">
          Quelle est votre consommation électrique mensuelle moyenne ?
        </Typography>

        {/* Boîtes de saisie */}
        <Box display="flex" flexDirection="column" gap={2} mt={2} width="100%">
          <TextField
            label="Consommation mensuelle en kWh"
            variant="outlined"
            fullWidth
            type="number"
            value={consumptionKwh}
            onChange={(e) => {
              setConsumptionKwh(e.target.value);
              setConsumptionEuro(""); // Reset autre champ
            }}
            disabled={!!consumptionEuro}
          />

          <TextField
            label="Mensualité moyenne en €"
            variant="outlined"
            fullWidth
            type="number"
            value={consumptionEuro}
            onChange={(e) => {
              setConsumptionEuro(e.target.value);
              setConsumptionKwh(""); // Reset autre champ
            }}
            disabled={!!consumptionKwh}
          />
        </Box>

        {/* Message d'erreur */}
        {error && <Typography color="error" mt={2}>{error}</Typography>}

        {/* Bouton Suivant */}
        <Box mt={4} display="flex" justifyContent="flex-end" width="100%">
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Envoi en cours..." : "Suivant"}
          </Button>
        </Box>
      </Box>

      {/* Bandeau Publicitaire (visible seulement sur Desktop) */}
      {!isMobile && (
  <Box
    sx={{
      width: "34%",
      borderRadius: 2,
      boxShadow: 2,
      marginLeft: 3,
      overflow: "hidden",
    }}
  >
    <SidebarBanner />
  </Box>
)}
    </Box>
  );
};

export default FormStep2;
