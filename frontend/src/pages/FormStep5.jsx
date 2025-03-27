import React, { useState } from "react";
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel, LinearProgress, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom"; 
import logo from "../assets/egsl.png"; 

const FormStep5 = ({ onPrevious, onNext }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    acceptTerms: false
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);
  const isPhoneValid = (phone) => /^[0-9]{10}$/.test(phone);

  const isFormValid = () => (
    formData.firstName &&
    formData.lastName &&
    isEmailValid(formData.email) &&
    isPhoneValid(formData.phone) &&
    formData.acceptTerms
  );

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Veuillez remplir correctement tous les champs.");
      return;
    }

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      console.error("❌ sessionId introuvable !");
      setError("Erreur : session expirée, veuillez recommencer.");
      return;
    }

    const userData = {
      sessionId,
      ...formData
    };

    console.log("📩 Envoi des données utilisateur :", userData);

    try {
      const response = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Erreur lors de l'enregistrement.");
      }

      console.log("✅ Données enregistrées avec succès !");
      onNext(userData);
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      setError("Erreur serveur, veuillez réessayer.");
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "row" }}>
      
      {/* Section principale 2/3 */}
      <Box width={isMobile ? "100%" : "66%"} p={4} bgcolor="#FFFFFF" display="flex" flexDirection="column" justifyContent="center">
        
        {/* Logo */}
        <Box mb={3} display="flex" justifyContent="center">
          <img src={logo} alt="EGSL Logo" style={{ height: 50 }} />
        </Box>

        {/* Barre de progression */}
        <LinearProgress variant="determinate" value={100} sx={{ my: 2 }} />

        {/* Question */}
        <Typography variant="h6" fontWeight="bold" gutterBottom color="black">
          À qui devons-nous envoyer la simulation ?
        </Typography>

        {/* Formulaire */}
        <Box mt={2}>
          <TextField fullWidth label="Votre prénom" name="firstName" value={formData.firstName} onChange={handleChange} margin="normal"/>
          <TextField fullWidth label="Votre nom" name="lastName" value={formData.lastName} onChange={handleChange} margin="normal"/>
          <TextField fullWidth label="Votre email" name="email" value={formData.email} onChange={handleChange} margin="normal" error={!isEmailValid(formData.email)} helperText={!isEmailValid(formData.email) ? "Email invalide" : ""}/>
          <TextField fullWidth label="Votre numéro de mobile" name="phone" value={formData.phone} onChange={handleChange} margin="normal" error={!isPhoneValid(formData.phone)} helperText={!isPhoneValid(formData.phone) ? "Numéro invalide (10 chiffres)" : ""}/>
          <FormControlLabel control={<Checkbox name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />} label="J'accepte les conditions d'utilisation."/>
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Box>

        {/* Boutons */}
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="primary" onClick={onPrevious}>
            ← Retour
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!isFormValid()}>
            J'obtiens ma simulation →
          </Button>
        </Box>
      </Box>

      {/* Section Bandeau Publicitaire 1/3 */}
      {!isMobile && (
        <Box width="34%" bgcolor="#F5F5F5" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6" fontWeight="bold" color="primary">
            Bandeau publicitaire de l'entreprise
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FormStep5;
