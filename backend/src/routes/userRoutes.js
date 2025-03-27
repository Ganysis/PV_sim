const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

/**
 * Route pour FormStep1 : Création ou mise à jour de l'utilisateur avec sessionId et status.
 */
router.post("/", async (req, res) => {
    console.log("📩 Données reçues du formulaire :", JSON.stringify(req.body, null, 2));

    try {
        const { sessionId, status } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID requis" });
        }

        let user = await prisma.user.findUnique({ where: { sessionId } });

        if (!user) {
            // Création de l'utilisateur si non existant
            user = await prisma.user.create({
                data: { sessionId, status }
            });
        } else {
            // Mise à jour de l'utilisateur existant
            user = await prisma.user.update({
                where: { sessionId },
                data: { status }
            });
        }

        console.log("✅ Utilisateur enregistré/mis à jour :", user);
        res.status(201).json(user);
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

/**
 * Route pour FormStep2 : Mise à jour de la consommation électrique.
 */
router.put("/consumption", async (req, res) => {
    console.log("📩 Données reçues du formulaire :", JSON.stringify(req.body, null, 2));

    try {
        const { sessionId, electricity, consumptionType } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID requis" });
        }
        if (!electricity) {
            return res.status(400).json({ error: "Valeur de consommation requise" });
        }

        let user = await prisma.user.findUnique({ where: { sessionId } });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Mise à jour de la consommation
        user = await prisma.user.update({
            where: {
              sessionId: sessionId
            },
            data: {
              electricity: electricity.toString(),  // ✅ Convertir en STRING
              consumptionType: consumptionType || null
            }
          });
          

        console.log("✅ Consommation mise à jour :", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.put("/address", async (req, res) => {
    console.log("📩 Données reçues :", JSON.stringify(req.body, null, 2));

    try {
        const { sessionId, address, latitude, longitude } = req.body;

        if (!sessionId || !address || !latitude || !longitude) {
            return res.status(400).json({ error: "Données incomplètes" });
        }

        let user = await prisma.user.findUnique({ where: { sessionId } });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        user = await prisma.user.update({
            where: { sessionId },
            data: { address, latitude, longitude }
        });

        console.log("✅ Adresse mise à jour :", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Erreur :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.put("/update", async (req, res) => {
    console.log("📩 Mise à jour de l'utilisateur :", JSON.stringify(req.body, null, 2));

    try {
        const { sessionId, firstName, lastName, email, phone } = req.body;

        if (!sessionId || !firstName || !lastName || !email || !phone) {
            console.error("❌ Données incomplètes reçues :", req.body);
            return res.status(400).json({ error: "Données incomplètes." });
        }

        console.log(`🔍 Vérification utilisateur avec sessionId : ${sessionId}`);
        const user = await prisma.user.findUnique({ where: { sessionId } });

        if (!user) {
            console.error("❌ Utilisateur non trouvé !");
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Mise à jour de l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { sessionId },
            data: { firstName, lastName, email, phone }
        });

        console.log("✅ Utilisateur mis à jour avec succès :", updatedUser);
        res.json({ message: "Données mises à jour avec succès.", user: updatedUser });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur.", details: error.message });
    }
});


router.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID requis" });
        }

        const user = await prisma.user.findUnique({
            where: { sessionId },
            include: { solarEstimates: true } // Récupère aussi les estimations solaires
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des données :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});
router.get("/:sessionId/solar-estimate", async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID requis" });
        }

        // Vérifie si l'utilisateur existe et récupère ses estimations solaires
        const user = await prisma.user.findUnique({
            where: { sessionId },
            include: { solarEstimates: true } // Inclut les estimations solaires
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (!user.solarEstimates || user.solarEstimates.length === 0) {
            return res.status(404).json({ error: "Aucune estimation solaire trouvée pour cet utilisateur" });
        }

        res.status(200).json(user.solarEstimates);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des estimations solaires :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

router.get("/:sessionId/project", async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID requis" });
        }

        const user = await prisma.user.findUnique({
            where: { sessionId },
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // On ne renvoie que les données pertinentes du projet
        const projectData = {
            address: user.address || "Adresse inconnue",
            roofOrientation: user.roofOrientation || "Orientation inconnue",
        };

        res.status(200).json(projectData);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du projet :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});








module.exports = router;
