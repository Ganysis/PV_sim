require("dotenv").config(); // Charge les variables d'environnement

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Configuration correcte de CORS
app.use(cors({
    origin: "http://localhost:5173", // Remplace par "*" si tu veux tout autoriser (pas recommandé en prod)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Permet d'envoyer des cookies si nécessaire
}));

// ✅ Middlewares
app.use(express.json());
app.use(bodyParser.json());

// ✅ Import des routes
const userRoutes = require("./routes/userRoutes");
const solarRoutes = require("./routes/solarRoutes");

// ✅ Utilisation des routes
app.use("/api/users", userRoutes);
app.use("/api/solar", solarRoutes);

// ✅ Définition du port
const PORT = process.env.PORT || 5000;

// ✅ Lancement du serveur si ce fichier est exécuté directement
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
        console.log("📌 Routes disponibles :");
        console.log("➡️  /api/users");
        console.log("➡️  /api/solar");
    });
}

// ✅ Export du serveur pour les tests (Jest/Supertest)
module.exports = app;
