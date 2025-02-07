const pool = require('../../../config/mariadb-db');
const { session } = require('../../../config/neo4j-db');

async function createEntities(req, res) {
    const { base } = req.params;
    const { frq, nbUsers, nbFollowers, nbProduits, nbCommandes } = req.body;
    console.log('freq', frq, 'nbUsers', nbUsers, 'nbFollowers', nbFollowers, 'nbProduits', nbProduits, 'nbCommandes', nbCommandes);
    try {
        const conn = await pool.getConnection();
        console.log('✅ Connexion à MariaDB réussie !');
        const rows = await conn.query('SELECT 1'); // Requête test
        console.log('✅ Requête test exécutée avec succès :', rows);
        conn.release();
    } catch (err) {
        console.error('❌ Erreur de connexion à MariaDB :', err);
    }
    res.status(200).json({ message: 'Log effdeeectué' });
}





module.exports = { createEntities };