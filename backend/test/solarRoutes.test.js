const request = require('supertest');
const app = require('../../src/server');

describe('Tests des routes Solar', () => {
    test('POST /api/solar - Retourne les données solaires pour une adresse valide', async () => {
        const res = await request(app).post('/api/solar').send({
            address: 'Paris, France',
            electricityType: 'price'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
        expect(res.body).toHaveProperty('solarProduction');
    });

    test('POST /api/solar - Erreur si adresse absente', async () => {
        const res = await request(app).post('/api/solar').send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', "Adresse manquante.");
    });
});
