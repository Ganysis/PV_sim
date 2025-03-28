const nodemailer = require('nodemailer');

/**
 * Service d'envoi d'emails pour les notifications administratives
 */
class EmailService {
  constructor() {
    // Initialisation du transporteur d'emails
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email de l'administrateur (destinataire)
    this.adminEmail = process.env.ADMIN_EMAIL;

    // Email expéditeur
    this.senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  }

  /**
   * Envoie une notification pour une nouvelle simulation
   * @param {Object} simulation - Les données de la simulation
   * @param {Object} user - Les données de l'utilisateur
   * @returns {Promise} - Résultat de l'envoi d'email
   */
  async sendNewSimulationNotification(simulation, user) {
    try {
      // Formatage de l'adresse du client pour l'affichage
      const userAddress = user.address || 'Non renseignée';
      
      // Calcul d'une note de qualité du prospect (exemple simplifié)
      // Un prospect propriétaire avec un bon potentiel solaire est considéré comme "chaud"
      const isOwner = user.status === 'propriétaire';
      const hasGoodSolarPotential = simulation.yearlyEnergyAcKwh > 3000;
      const hasContactInfo = user.phone || user.email;
      
      let leadQuality = 'Modéré';
      if (isOwner && hasGoodSolarPotential && hasContactInfo) {
        leadQuality = '🔥 Chaud';
      } else if (isOwner || hasGoodSolarPotential) {
        leadQuality = '👍 Intéressant';
      }

      // Création du contenu HTML de l'email
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1976d2; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .info-label { font-weight: bold; width: 180px; }
              .highlight { color: #1976d2; font-weight: bold; }
              .warning { color: #d32f2f; }
              .success { color: #2e7d32; }
              .button { display: inline-block; background-color: #1976d2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🌞 Nouvelle Simulation Photovoltaïque</h2>
              </div>
              <div class="content">
                <div class="section">
                  <h3 class="section-title">Informations Client</h3>
                  <div class="info-row">
                    <div class="info-label">Nom:</div>
                    <div>${user.firstName || ''} ${user.lastName || ''}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Statut:</div>
                    <div>${user.status || 'Non renseigné'}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Téléphone:</div>
                    <div>${user.phone || 'Non renseigné'}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div>${user.email || 'Non renseigné'}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Adresse:</div>
                    <div>${userAddress}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Qualité du prospect:</div>
                    <div class="highlight">${leadQuality}</div>
                  </div>
                </div>

                <div class="section">
                  <h3 class="section-title">Détails de l'Installation</h3>
                  <div class="info-row">
                    <div class="info-label">Puissance:</div>
                    <div>${simulation.installationSizeKw.toFixed(1)} kWc</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Panneaux:</div>
                    <div>${simulation.panelsCount} panneaux</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Orientation:</div>
                    <div>${simulation.roofOrientation || 'Non précisée'} ${simulation.roofTilt ? `(${simulation.roofTilt}°)` : ''}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Production annuelle:</div>
                    <div>${Math.round(simulation.yearlyEnergyAcKwh)} kWh/an</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Coût estimé:</div>
                    <div>${Math.round(simulation.installationCost)} €</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Économies annuelles:</div>
                    <div class="success">${Math.round(simulation.firstYearSavingsWithSell)} €/an</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Retour sur investissement:</div>
                    <div>${simulation.paybackYears.toFixed(1)} ans</div>
                  </div>
                </div>

                <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin/dashboard'}" class="button">
                  Accéder au tableau de bord
                </a>
              </div>
            </div>
          </body>
        </html>
      `;

      // Options de l'email
      const mailOptions = {
        from: `"Simulateur PV" <${this.senderEmail}>`,
        to: this.adminEmail,
        subject: `Nouvelle simulation PV - ${user.firstName || ''} ${user.lastName || ''}`,
        html: htmlContent
      };

      // Envoi de l'email
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de notification envoyé: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
module.exports = new EmailService();