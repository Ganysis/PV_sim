const axios = require('axios');
require('dotenv').config();

const getCoordinatesFromAddress = async (address) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error("Clé API Google manquante.");

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        console.log("🔍 URL API Geocoding:", url);

        const response = await axios.get(url);
        console.log("📡 Réponse complète:", response.data);

        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            throw new Error(`Erreur API Google Geocoding: ${response.data.status}`);
        }
    } catch (error) {
        console.error("Erreur Geocoding:", error.message);
        throw error;
    }
};


module.exports = { getCoordinatesFromAddress };
