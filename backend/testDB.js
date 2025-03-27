const pool = require('./src/config/db'); // Remonter d'un dossier

async function testDB() {
  console.log("🚀 Test de connexion à la base de données en cours...");
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ Connexion réussie ! Date et heure PostgreSQL :", res.rows[0]);
  } catch (err) {
    console.error("❌ Erreur lors du test de la base de données :", err);
  } finally {
    console.log("🔄 Fermeture de la connexion...");
    await pool.end();
    console.log("🔚 Connexion fermée.");
  }
}

testDB();
