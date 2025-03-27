// Chargement des modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

// Configuration
dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Route pour enregistrer un prospect
app.post('/prospect', async (req, res) => {
    try {
        const { nom, email, telephone, adresse, consommation, equipements } = req.body;
        const prospect = await prisma.prospect.create({
            data: { nom, email, telephone, adresse, consommation, equipements }
        });
        res.status(201).json(prospect);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l enregistrement du prospect' });
    }
});

// Route pour analyser le potentiel solaire via PVGIS
app.get('/analyse-solaire', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const response = await axios.get(`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${latitude}&lon=${longitude}&outputformat=json`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l analyse solaire' });
    }
});

// Route pour générer et envoyer un rapport
app.post('/send-report', async (req, res) => {
    try {
        const { email, nom } = req.body;
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            let pdfData = Buffer.concat(buffers);
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Votre analyse photovoltaïque',
                text: 'Voici votre rapport',
                attachments: [{ filename: 'rapport.pdf', content: pdfData }]
            });
            res.json({ message: 'Rapport envoyé avec succès' });
        });
        doc.text(`Rapport d'analyse photovoltaïque pour ${nom}`);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l envoi du rapport' });
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
