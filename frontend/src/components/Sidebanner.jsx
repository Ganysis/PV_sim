import React from "react";
import { Box, Typography } from "@mui/material";
import logo from "../assets/egsl.png"; // Importez votre logo EGSL

const SidebarBanner = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundImage: "url('/solar-roof.jpg')", // Assurez-vous d'avoir cette image dans votre dossier public
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "0 8px 8px 0",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)", // Assombrit légèrement l'image pour une meilleure lisibilité du texte
      }}
    >
      {/* Texte principal */}
      <Box
        sx={{
          padding: "30px",
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#FFFFFF",
            fontWeight: "bold",
            textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
            marginBottom: "10px",
          }}
        >
          EGSL
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#FFFFFF",
            textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          À vos côtés depuis 1996
        </Typography>
      </Box>

      {/* Logo RGE QualiPV36 */}
      <Box
        sx={{
          marginBottom: "40px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "15px",
          borderRadius: "8px",
          width: "70%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/qualipv36-logo.png" // Assurez-vous d'avoir ce logo dans votre dossier public
          alt="RGE QualiPV36"
          style={{ maxWidth: "100%", height: "auto", maxHeight: "80px" }}
        />
      </Box>
    </Box>
  );
};

export default SidebarBanner;