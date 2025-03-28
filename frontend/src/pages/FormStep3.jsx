import React, { useState, useEffect } from "react";
import { Box, Typography, Button, LinearProgress, TextField, useMediaQuery } from "@mui/material";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import logo from "../assets/egsl.png";
import SidebarBanner from "../components/Sidebanner";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const mapContainerStyle = { width: "100%", height: "400px", borderRadius: 8, marginTop: "10px" };
const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

const FormStep3 = ({ onNext, onPrevious }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [sessionId, setSessionId] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Chargement de l'API Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      setError("Session invalide, veuillez recommencer.");
    }
  }, []);

  // Lorsqu'une adresse est sélectionnée avec Google Autocomplete
  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setCoordinates({
          lat: parseFloat(place.geometry.location.lat().toFixed(10)), // ✅ Conversion en Float
          lng: parseFloat(place.geometry.location.lng().toFixed(10)), // ✅ Conversion en Float
        });
        setAddress(place.formatted_address);
      }
    }
  };

  // Lorsqu'on déplace le marqueur
  const handleMarkerDrag = (event) => {
    setCoordinates({
      lat: parseFloat(event.latLng.lat().toFixed(10)), // ✅ Conversion en Float
      lng: parseFloat(event.latLng.lng().toFixed(10)), // ✅ Conversion en Float
    });
  };

  // Envoyer les données au backend
  const handleSubmit = async () => {
    if (!address) {
      setError("Veuillez entrer une adresse.");
      return;
    }

    setLoading(true); // ⏳ Indicateur de chargement

    try {
      console.log("📡 Envoi des coordonnées précises :", {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });

      const response = await fetch("http://localhost:5000/api/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          address,
          latitude: coordinates.lat, // ✅ Valeurs bien en `Float`
          longitude: coordinates.lng, // ✅ Valeurs bien en `Float`
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement.");
      }

      console.log("✅ Adresse et coordonnées enregistrées :", { address, coordinates });
      setLoading(false);
      onNext(); // Passer à l'étape suivante
    } catch (err) {
      console.error("❌ Erreur :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Box sx={{ textAlign: "center", mt: 5, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography mt={2}>⏳ Chargement de la carte...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "row" }}>
      {/* Section principale 2/3 */}
      <Box width={isMobile ? "100%" : "66%"} p={4} bgcolor="#FFFFFF" display="flex" flexDirection="column" justifyContent="center">
        
        {/* Logo */}
        <Box mb={3} display="flex" justifyContent="center">
          <img src={logo} alt="EGSL Logo" style={{ height: 50 }} />
        </Box>

        {/* Barre de progression */}
        <LinearProgress variant="determinate" value={75} sx={{ my: 2 }} />

        {/* Question */}
        <Typography variant="h6" fontWeight="bold" gutterBottom color="black">
          Question 3/4
        </Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="black">
          Quelle est votre adresse ?
        </Typography>

        {/* Adresse avec Autocomplete Google */}
        <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
          <TextField
            label="Entrez votre adresse"
            variant="outlined"
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ my: 2 }}
          />
        </Autocomplete>

        {/* Indication pour l'utilisateur */}
        <Typography variant="body1" mt={2} color="black">
          📌 Vous pouvez déplacer le marqueur pour ajuster la position sur votre toit.
        </Typography>

        {/* Carte Google Maps en mode Satellite */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates}
          zoom={19}
          mapTypeId="satellite" 
          options={{
            tilt: 0, 
            mapTypeControl: false,
            mapTypeId: "satellite",
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={coordinates} draggable={true} onDragEnd={handleMarkerDrag} />
        </GoogleMap>

        {/* Message d'erreur */}
        {error && <Typography color="error" mt={2}>{error}</Typography>}

        {/* Boutons */}
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="outlined" color="primary" onClick={onPrevious} disabled={loading}>
            Précédent
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Suivant"}
          </Button>
        </Box>
      </Box>

      {/* Section Bandeau Publicitaire 1/3 */}
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

export default FormStep3;
