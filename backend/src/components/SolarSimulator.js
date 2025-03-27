const express = require('express');
const { getCoordinatesFromAddress } = require('../services/geocodingService');
const { getSolarData } = require('../services/solarService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Adresse manquante.' });
        }

        const { lat, lng } = await getCoordinatesFromAddress(address);
        
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Impossible de récupérer les coordonnées de l\'adresse.' });
        }

        console.log(`Coordonnées pour '${address}': Latitude ${lat}, Longitude ${lng}`);

        const solarData = await getSolarData(lat, lng);

        if (!solarData || !solarData.solarProduction) {
            return res.status(500).json({ error: 'Impossible de récupérer les données solaires.' });
        }

        console.log('Données solaires reçues:', solarData);
        res.status(200).json(solarData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données solaires:', error);

        if (error.response) {
            console.error('Détails de l\'erreur API:', error.response.data);
        }

        res.status(500).json({ error: 'Erreur serveur lors du calcul solaire.' });
    }
});

module.exports = router;
