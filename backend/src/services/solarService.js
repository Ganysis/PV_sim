const axios = require("axios");
require("dotenv").config();

// 🌞 Récupération des données d'ensoleillement depuis PVGIS
const getPVGISData = async (latitude, longitude) => {
    try {
        const url = `https://re.jrc.ec.europa.eu/api/v5_3/MRcalc?lat=${latitude}&lon=${longitude}&horirrad=1&outputformat=json`;
        console.log(`🔗 Requête envoyée à PVGIS : ${url}`);

        const response = await axios.get(url);
        
        if (response.status === 200 && response.data?.outputs?.monthly?.length) {
            console.log("✅ Données PVGIS reçues :", response.data.outputs.monthly);
            return response.data.outputs.monthly;
        } else {
            console.error("⚠️ Aucune donnée exploitable reçue de PVGIS.");
            return null;
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'appel à PVGIS :", error.response?.data || error.message);
        return null;
    }
};

// ⚡ Récupération des données de production solaire depuis Google Solar API
const getSolarData = async (latitude, longitude) => {
    try {
        const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
        
        if (!apiKey) {
            console.error("❌ Clé API Google Solar manquante. Vérifiez votre fichier .env.");
            return null;
        }

        const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&requiredQuality=HIGH&key=${apiKey}`;
        console.log(`🔗 Requête envoyée à Google Solar API: ${url}`);

        const response = await axios.get(url);

        if (response.status === 200 && response.data?.solarPotential) {
            console.log("✅ Données solaires reçues:", response.data);
            return response.data;
        } else {
            console.error(`⚠️ Aucune donnée exploitable reçue de Google Solar API.`);
            return null;
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des données solaires :", error.response?.data || error.message);
        return null;
    }
};

// 🌍 Exportation des fonctions
module.exports = { getPVGISData, getSolarData };
