const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const router = express.Router();

// Middleware pour vérifier l'authentification admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Accès non autorisé - Token manquant" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si l'admin existe toujours
    const admin = await prisma.admin.findUnique({ 
      where: { id: decoded.adminId } 
    });
    
    if (!admin) {
      return res.status(401).json({ error: "Administrateur non trouvé" });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(401).json({ error: "Accès non autorisé - Token invalide" });
  }
};

// Route d'authentification pour les admins
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Création du token JWT
    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Journalisation de la connexion
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "LOGIN",
        ipAddress: req.ip
      }
    });

    res.json({ 
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      } 
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour récupérer toutes les simulations
router.get("/simulations", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Construction des conditions de recherche
    let where = {};
    if (search) {
      where = {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { address: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } }
        ]
      };
    }

    // Récupérer les simulations avec pagination
    const simulations = await prisma.solarEstimate.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    // Compter le nombre total de simulations pour la pagination
    const total = await prisma.solarEstimate.count({ where });

    // Journaliser l'action de consultation
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: "VIEW_SIMULATIONS",
        ipAddress: req.ip
      }
    });

    res.json({
      simulations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des simulations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour récupérer une simulation spécifique
router.get("/simulations/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await prisma.solarEstimate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            status: true,
            electricity: true,
            createdAt: true
          }
        }
      }
    });

    if (!simulation) {
      return res.status(404).json({ error: "Simulation non trouvée" });
    }

    // Journaliser l'action de consultation détaillée
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: "VIEW_SIMULATION_DETAIL",
        details: `ID: ${id}`,
        ipAddress: req.ip
      }
    });

    res.json(simulation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la simulation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour marquer un prospect comme contacté
router.post("/simulations/:id/contact", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Vérifier si la simulation existe
    const simulation = await prisma.solarEstimate.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!simulation) {
      return res.status(404).json({ error: "Simulation non trouvée" });
    }

    // Créer un enregistrement de contact
    const contact = await prisma.userContact.create({
      data: {
        userId: simulation.userId,
        adminId: req.admin.id,
        notes: notes || "",
        contactMethod: "MANUAL",
      }
    });

    // Journaliser l'action
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: "CONTACT_USER",
        details: `User ID: ${simulation.userId}`,
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      message: "Contact enregistré avec succès",
      contact
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du contact:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour obtenir des statistiques générales
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Récupérer les statistiques
    const [
      totalSimulations,
      simulationsLastMonth,
      simulationsToday,
      averageInstallationSize,
      totalProprietaires,
      totalLocataires
    ] = await Promise.all([
      prisma.solarEstimate.count(),
      prisma.solarEstimate.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      prisma.solarEstimate.count({
        where: {
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.solarEstimate.aggregate({
        _avg: {
          installationSizeKw: true
        }
      }),
      prisma.user.count({
        where: {
          status: "propriétaire"
        }
      }),
      prisma.user.count({
        where: {
          status: "locataire"
        }
      })
    ]);
    
    res.json({
      totalSimulations,
      simulationsLastMonth,
      simulationsToday,
      averageInstallationSize: averageInstallationSize._avg.installationSizeKw,
      totalProprietaires,
      totalLocataires
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour créer un admin (à utiliser avec précaution)
router.post("/create", async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Vérifier la clé secrète pour la création d'admin
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: "Clé secrète invalide" });
    }

    // Vérifier si l'email est déjà utilisé
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      message: "Administrateur créé avec succès",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;