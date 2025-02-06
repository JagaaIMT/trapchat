// /tests/server.test.js
const mariadb = require('mariadb');
const pool = require('../config/mariadb-db');
const dotenv = require('dotenv');

dotenv.config();

describe('Test de la base de données', () => {
    let connection;
    beforeAll(async () => {
        try {
            connection = await pool.getConnection();
            console.log('Connexion à la base de données réussie !');
        } catch (error) {
            console.error('Erreur de connexion à la base de données:', error);
            throw error; 
        }
    });

    it('devrait réussir à se connecter à MariaDB', async () => {
    const result = await connection.query('SELECT 1 as val');
    expect(result[0].val).toBe(1); 
    });
});
