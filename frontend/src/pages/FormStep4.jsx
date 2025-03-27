import React, { useState } from "react";
import { Box, Typography, Button, LinearProgress, Grid, Card, CardContent, Checkbox, useMediaQuery } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import logo from "../assets/egsl.png";
import SidebarBanner from "../components/Sidebanner";

const equipmentOptions = [
  { id: "pac_air_air", label: "Pompe à Chaleur Air-Air", icon: "🌬️" },
  { id: "pac_air_eau", label: "Pompe à Chaleur Air-Eau", icon: "💧" },
  { id: "radiateur", label: "Radiateur électrique", icon: "🔥" },
  { id: "climatisation", label: "Air conditionné", icon: "❄️" },
  { id: "ballon", label: "Ballon électrique", icon: "🔋" },
  { id: "voiture", label: "Voiture électrique", icon: "🚗" },
  { id: "piscine", label: "Piscine", icon: "🏊" },
];

const FormStep4 = ({ onNext, onPrevious }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleToggle = (id) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
          Question 4/4
        </Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="black">
          Quels sont les équipements de votre logement ?
        </Typography>

        {/* Grille des équipements */}
        <Grid container spacing={2} mt={2}>
          {equipmentOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.id}>
              <Card
                variant="outlined"
                sx={{
                  textAlign: "center",
                  borderColor: selectedOptions.includes(option.id) ? "blue" : "#ddd",
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { borderColor: "blue" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                }}
                onClick={() => handleToggle(option.id)}
              >
                <Checkbox checked={selectedOptions.includes(option.id)} icon={<CheckCircle />} />
                <Typography variant="h4">{option.icon}</Typography>
                <Typography variant="body1">{option.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Boutons Précédent / Continuer */}
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="primary" onClick={onPrevious}>
            ← Retour
          </Button>
          <Button variant="contained" color="primary" onClick={() => onNext({ equipment: selectedOptions })}>
            Continuer →
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

export default FormStep4;
