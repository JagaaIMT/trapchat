const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function searchProducts(req, res) {
    const { base, product } = req.params;
    if (base === 'mariadb') {
        return getProductsMariadb(product, res);
    } else if (base === 'neo4j') {
        return getProductsNeo4j(product, res);
    }
    return res.status(500).json({ error: 'Erreur lors de la recherche.' });
}

const getProductsMariadb = async (product, res) => {
    try {
        let query, params;
        if (!product) {
            query = `SELECT * FROM produits LIMIT 10`;
            params = [];
        } else {
            query = `SELECT * FROM produits WHERE nom_produit LIKE CONCAT('%', ?, '%') LIMIT 10`;
            params = [product];
        }
        const result = await pool.query(query, params);
        const products = result.map(record => record.product);
        return res.status(200).json({ data: products });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getProductsNeo4j = async (product, res) => {
    const session = driver.session();
    try {
        let cypherQuery, params;
        if (!product) {
            cypherQuery = `
                MATCH (u:Produit)
                RETURN u.nom AS produit
                LIMIT 10
            `;
            params = {};
        } else {
            cypherQuery = `
                MATCH (u:Produit)
                WHERE u.nom CONTAINS $nom
                RETURN u.nom AS produit
                LIMIT 10
            `;
            params = { product };
        }
        const result = await session.run(cypherQuery, params);
        const products = result.records.map(record => record.get('produit'));
        return res.status(200).json({ data: products });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

module.exports = { searchProducts };