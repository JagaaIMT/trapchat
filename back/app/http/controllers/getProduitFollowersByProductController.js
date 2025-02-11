const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function getProduitFollowersByProduct(req, res,) {
    const { base, email, productId, lvl } = req.params;
    console.log('base', base, 'email', email, 'productId', productId, 'lvl', lvl);

    if (base === 'mariadb') {
        return getProduitFollowersByProductMaria(email, lvl, productId, res);
    } else if (base === 'neo4j') {
        return getProduitFollowersByProductNeo4j(email, lvl, productId, res);
    }
    return res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
}

async function getProduitFollowersByProductMaria(email, lvl, productId, res) {
    res.status(200).json({ message: 'Maria db' });
}

async function getProduitFollowersByProductNeo4j(email, lvl, productId, res) {
    if (!email || !productId || !lvl) {
        return res.status(400).json({ error: 'Les paramètres "email" et "produit id" ou "lvl" sont requis.' });
    }

    const session = driver.session();
    try {
        const query = `
          MATCH (influencer:Utilisateur {email: '${email}'})
          MATCH p = (follower:Utilisateur)-[:FOLLOWS*1..${lvl}]->(influencer)
          WITH follower, min(length(p)) AS niveau
          MATCH (follower)-[cmd:A_COMMANDÉ]->(produit:Produit {id: '${productId}'})
          RETURN niveau,
                 produit.nom AS produit,
                 count(cmd) AS nbCommandes,
                 collect(DISTINCT follower.email) AS acheteurs
          ORDER BY niveau, nbCommandes DESC
        `;

        const result = await session.run(query, { email, lvl, productId });
        const data = result.records.map(record => ({
            niveau: record.get('niveau'),
            produit: record.get('produit'),
            nbCommandes: record.get('nbCommandes').toNumber ? record.get('nbCommandes').toNumber() : record.get('nbCommandes'),
            acheteurs: record.get('acheteurs')
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur dans /api/produits-par-followers-produit:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
}

module.exports = { getProduitFollowersByProduct };