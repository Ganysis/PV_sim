const pool = require("../config/db");

const ajouterProspect = async (req, res) => {
  try {
    const {
      statut,
      facture_elec,
      adresse,
      latitude,
      longitude,
      equipements,
      nom,
      prenom,
      email,
      telephone,
      consentement,
      promo
    } = req.body;

    const query = `
      INSERT INTO prospects (statut, facture_elec, adresse, latitude, longitude, equipements, nom, prenom, email, telephone, consentement, promo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      statut,
      facture_elec,
      adresse,
      latitude,
      longitude,
      equipements,
      nom,
      prenom,
      email,
      telephone,
      consentement,
      promo
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du prospect :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = { ajouterProspect };
