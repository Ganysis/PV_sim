const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const { getCoordinatesFromAddress } = require("../services/geocodingService");
const { getSolarData, getPVGISData } = require("../services/solarService");
const emailService = require("../services/emailService"); // Nouveau: Import du service d'email

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("📩 Requête reçue :", req.body);
        const { sessionId, address, latitude, longitude } = req.body;

        if (!sessionId || !address) {
            return res.status(400).json({ error: "Données incomplètes." });
        }

        const user = await prisma.user.findUnique({ where: { sessionId } });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        let lat = parseFloat(latitude);
        let lng = parseFloat(longitude);

        if (!lat || !lng) {
            console.log("🌍 Géocodage de l'adresse...");
            const geocodedCoords = await getCoordinatesFromAddress(address);
            lat = parseFloat(geocodedCoords.lat);
            lng = parseFloat(geocodedCoords.lng);
        }

        console.log(`📡 Coordonnées : lat=${lat}, lng=${lng}`);

        const solarData = await getSolarData(lat, lng);
        if (!solarData?.solarPotential?.solarPanelConfigs) {
            return res.status(500).json({ error: "Impossible d'obtenir les données solaires." });
        }

        let bestConfig = null;
        let bestSelfConsumption = 0;
        const electricityConsumption = parseFloat(user.electricity) || 4000;

        solarData.solarPotential.solarPanelConfigs.forEach((config) => {
            const estimatedSelfConsumption = (config.yearlyEnergyDcKwh / (electricityConsumption * 12)) || 0;
            if (estimatedSelfConsumption >= 0.4 && estimatedSelfConsumption <= 0.7) {
                bestConfig = config;
                bestSelfConsumption = estimatedSelfConsumption;
            }
        });

        if (!bestConfig) {
            bestConfig = solarData.solarPotential.solarPanelConfigs[0];
        }

        console.log("🏆 Meilleure configuration choisie :", bestConfig);

        const roofTilt = parseFloat(bestConfig?.roofSegmentSummaries[0]?.pitchDegrees) || null;
        const azimuthDegrees = parseFloat(bestConfig?.roofSegmentSummaries[0]?.azimuthDegrees) || null;
        const roofOrientation = getOrientation(azimuthDegrees);

        const panelsCount = Math.min(bestConfig?.panelsCount || 0, solarData.solarPotential.maxArrayPanelsCount);
        const panelCapacityWatts = 500;
        const installationSizeKw = (panelsCount * panelCapacityWatts) / 1000;
        const installationCost = installationSizeKw * 2330;
        const yearlyEnergyDcKwh = parseFloat(bestConfig?.yearlyEnergyDcKwh) || 0;
        const yearlyEnergyAcKwh = yearlyEnergyDcKwh * 0.97;
        const firstYearSavings = 0;


        if (!yearlyEnergyAcKwh) {
            return res.status(500).json({ error: "Erreur de calcul de la production solaire." });
        }

        console.log(`✅ yearlyEnergyAcKwh : ${yearlyEnergyAcKwh}`);

        // 📊 Récupération des données PVGIS
        const pvgisData = await getPVGISData(lat, lng);
        console.log("🔍 Données PVGIS reçues :", pvgisData);

        if (!pvgisData || !Array.isArray(pvgisData) || pvgisData.length === 0) {
            console.error("❌ Erreur : PVGIS n'a pas renvoyé de données.");
            return res.status(500).json({ error: "Données d'ensoleillement indisponibles." });
        }

        // 📉 Extraction des données de la dernière année disponible
        const latestYear = Math.max(...pvgisData.map(month => month.year));
        console.log(`📆 Dernière année disponible : ${latestYear}`);

        const latestYearData = pvgisData
            .filter(month => month.year === latestYear && month["H(h)_m"] !== undefined)
            .map(month => ({
                mois: month.month,
                irradiation: month["H(h)_m"],
                adjustedEnergyKwh: parseFloat((yearlyEnergyAcKwh * (month["H(h)_m"] / 1000)).toFixed(2))
            }));

        if (latestYearData.length === 0) {
            return res.status(500).json({ error: "Données PVGIS invalides." });
        }

        const avgIrradiation = latestYearData.reduce((sum, month) => sum + month.irradiation, 0) / latestYearData.length;
        const adjustedYearlyEnergyAcKwh = latestYearData.reduce((sum, month) => sum + month.adjustedEnergyKwh, 0);

        const electricityPrice = 0.2016;
        const gridSellPrice = 0.1269;
        const selfConsumptionRate = 0.6;
        const exportedToGrid = 1 - selfConsumptionRate;
        console.log("🔍 adjustedYearlyEnergyAcKwh :", adjustedYearlyEnergyAcKwh);
console.log("🔍 selfConsumptionRate :", selfConsumptionRate);
console.log("🔍 electricityPrice :", electricityPrice);
console.log("🔍 exportedToGrid :", exportedToGrid);
console.log("🔍 gridSellPrice :", gridSellPrice);
console.log("🔍 Calcul attendu :", 
    (adjustedYearlyEnergyAcKwh * selfConsumptionRate * electricityPrice) + 
    (adjustedYearlyEnergyAcKwh * exportedToGrid * gridSellPrice)
);
const energyConsumedByUser = adjustedYearlyEnergyAcKwh * selfConsumptionRate;
const energySoldToGrid = adjustedYearlyEnergyAcKwh * (1 - selfConsumptionRate);

const firstYearSavingsWithSell = (energyConsumedByUser * electricityPrice) + (energySoldToGrid * gridSellPrice);
const firstYearSavingsWithoutSell = energyConsumedByUser * electricityPrice;
const panelLifetimeYears = 25;

const savingsLifetimeWithSell = firstYearSavingsWithSell * panelLifetimeYears;
const savingsLifetimeWithoutSell = firstYearSavingsWithoutSell * panelLifetimeYears;

console.log("🔹 firstYearSavingsWithSell :", firstYearSavingsWithSell);
console.log("🔹 firstYearSavingsWithoutSell :", firstYearSavingsWithoutSell);
console.log("🔹 savingsLifetimeWithSell :", savingsLifetimeWithSell);
console.log("🔹 savingsLifetimeWithoutSell :", savingsLifetimeWithoutSell);
console.log("Panneaux sur ", panelLifetimeYears);




        const savingsLifetime = firstYearSavings * 25;

        let paybackYears = 0;
        let cumulativeSavings = 0;
        while (cumulativeSavings < installationCost && paybackYears < 25) {
            cumulativeSavings += firstYearSavings * Math.pow(1.022, paybackYears);
            paybackYears++;
        }

        const costOfElectricityWithoutSolar = electricityConsumption * 12 * electricityPrice;
        let remainingLifetimeUtilityBill = 0;
        for (let i = 0; i < 25; i++) {
            remainingLifetimeUtilityBill += costOfElectricityWithoutSolar * Math.pow(1.022, i);
        }

        const percentageExportedToGrid = 40;

        const solarEstimate = await prisma.solarEstimate.create({
            data: {
                user: { connect: { id: user.id } },
                latitude: lat,
                longitude: lng,
                maxArrayPanelsCount: solarData.solarPotential.maxArrayPanelsCount || 0,
                maxArrayAreaMeters2: solarData.solarPotential.maxArrayAreaMeters2 || 0,
                maxSunshineHoursPerYear: solarData.solarPotential.maxSunshineHoursPerYear || 0,
                yearlyEnergyDcKwh,
                yearlyEnergyAcKwh: adjustedYearlyEnergyAcKwh,
                monthlyProduction: latestYearData,
                installationSizeKw,
                installationCost,
                panelsCount,
                roofTilt,
                roofOrientation,
                solarPercentage: bestSelfConsumption * 100,
                firstYearSavings,
                savingsLifetime,
                paybackYears,
                firstYearSavingsWithoutSell,
                firstYearSavingsWithSell,
                costOfElectricityWithoutSolar,
                remainingLifetimeUtilityBill,
                percentageExportedToGrid,
                savingsLifetimeWithSell: savingsLifetimeWithSell || 0,  // 👈 Définit une valeur par défaut
                savingsLifetimeWithoutSell: savingsLifetimeWithoutSell || 0,
            },
        });

        console.log("✅ Simulation enregistrée :", solarEstimate);
        
        // NOUVEAU: Envoi de l'email de notification
        try {
            await emailService.sendNewSimulationNotification(solarEstimate, user);
            console.log("📧 Email de notification envoyé à l'administrateur");
        } catch (emailError) {
            // En cas d'erreur d'envoi d'email, on log l'erreur mais on continue
            console.error("❌ Erreur lors de l'envoi de l'email de notification:", emailError);
            // On ne renvoie pas d'erreur au client pour ne pas bloquer la réponse
        }
        
        res.status(201).json(solarEstimate);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

function getOrientation(degrees) {
    if (degrees === null || degrees === undefined) return "Inconnu";
    if (degrees >= 337.5 || degrees < 22.5) return "Nord";
    if (degrees >= 22.5 && degrees < 67.5) return "Nord-Est";
    if (degrees >= 67.5 && degrees < 112.5) return "Est";
    if (degrees >= 112.5 && degrees < 157.5) return "Sud-Est";
    if (degrees >= 157.5 && degrees < 202.5) return "Sud";
    if (degrees >= 202.5 && degrees < 247.5) return "Sud-Ouest";
    if (degrees >= 247.5 && degrees < 292.5) return "Ouest";
    return "Nord-Ouest";
}

router.get("/users/:sessionId/solar-estimate", async (req, res) => {
    console.log("✅ Route GET /users/:sessionId/solar-estimate appelée avec sessionId :", req.params.sessionId);

    try {
        const { sessionId } = req.params;

        // Vérification du sessionId
        if (!sessionId || typeof sessionId !== "string") {
            console.log("❌ sessionId invalide ou manquant :", sessionId);
            return res.status(400).json({ error: "sessionId invalide ou manquant." });
        }

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { sessionId },
        });

        if (!user) {
            console.log("❌ Utilisateur non trouvé pour sessionId :", sessionId);
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Log avant la requête Prisma
        console.log("🔍 Recherche de la dernière simulation pour userId :", user.id);

        // Utilisation explicite de findFirst pour obtenir UNE seule simulation
        const latestSimulation = await prisma.solarEstimate.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
        });
        
        if (!latestSimulation || latestSimulation.length === 0) {
            console.log("❌ Aucune simulation trouvée pour l'utilisateur :", user.id);
            return res.status(404).json({ error: "Aucune simulation trouvée." });
        }
        
        // Toujours récupérer le premier élément
        const singleSimulation = latestSimulation[0];
        
        console.log("🔍 Simulation finale envoyée :", singleSimulation);
        return res.status(200).json(singleSimulation);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return res.status(500).json({ error: "Erreur serveur." });
    }
});

module.exports = router;