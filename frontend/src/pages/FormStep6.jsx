import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import logo from "../assets/egsl.png"; 

const loadingMessages = [
  "🔍 Analyse du potentiel solaire...",
  "📊 Calcul de la rentabilité...",
  "🔋 Estimation des économies...",
  "📡 Récupération des données satellites...",
  "⚡ Optimisation de votre installation...",
];

const FormStep6 = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const totalTime = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000; // ⏳ 3 à 6 secondes
        const intervalTime = totalTime / 10;

        const interval = setInterval(() => {
            setProgress((oldProgress) => Math.min(oldProgress + 10, 100));
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, intervalTime);

        const timer = setTimeout(() => {
            clearInterval(interval);
            onComplete(); // 🔥 Passe à `Result.jsx`
        }, totalTime);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [onComplete]);

    return (
        <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#FFFFFF" }}>
            
            {/* Logo */}
            <Box mb={3}>
                <img src={logo} alt="EGSL Logo" style={{ height: 50 }} />
            </Box>

            {/* Animation de chargement */}
            <CircularProgress variant="determinate" value={progress} size={80} thickness={4} />

            {/* Texte dynamique (maintenant bien visible en noir) */}
            <Typography variant="h6" fontWeight="bold" mt={3} color="black">
                {loadingMessages[messageIndex]}
            </Typography>

            <Typography variant="body2" color="black" mt={1}>
                Cela peut prendre quelques instants...
            </Typography>
        </Box>
    );
};

export default FormStep6;
