import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, LinearProgress, useMediaQuery } from "@mui/material";
import logo from "../assets/egsl.png";
import SidebarBanner from "../components/Sidebanner";

const FormStep1 = ({ onNext }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [status, setStatus] = useState(""); // Propriétaire ou Locataire
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!status) {
      setError("Veuillez sélectionner une option.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Données enregistrées :", data);
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
        <LinearProgress variant="determinate" value={20} sx={{ width: "100%", my: 2 }} />

        {/* Question */}
        <Typography variant="h6" fontWeight="bold" gutterBottom color="black">
          Question 1/4
        </Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="black">
          Êtes-vous propriétaire ou locataire ?
        </Typography>

        {/* Boutons choix */}
        <Box display="flex" flexDirection="column" gap={2} mt={2} width="100%">
          <Button
            variant={status === "propriétaire" ? "contained" : "outlined"}
            color="primary"
            onClick={() => setStatus("propriétaire")}
            fullWidth
          >
            Propriétaire
          </Button>
          <Button
            variant={status === "locataire" ? "contained" : "outlined"}
            color="primary"
            onClick={() => setStatus("locataire")}
            fullWidth
          >
            Locataire
          </Button>
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

export default FormStep1;
