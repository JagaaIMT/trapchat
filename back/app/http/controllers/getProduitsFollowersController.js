const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function getProduitsFollowers(req, res,) {
    const { base, email, lvl } = req.params;
    console.log('base', base, 'email', email, 'lvl', lvl);

    if (base === 'mariadb') {
        return getProduitsFollowersMaria(email, lvl, res);
    } else if (base === 'neo4j') {
        return getProduitsFollowersNeo4j(email, lvl, res);
    }
    return res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
}

async function getProduitsFollowersMaria(email, lvl, res) {
    res.status(200).json({ message: 'Maria db' });
}

async function getProduitsFollowersNeo4j(email, lvl, res) {
    if (!email || !lvl) {
        return res.status(400).json({ error: 'Le paramètre "email" ou "lvl" est requis.' });
    }

    const session = driver.session();

    try {
        const query = `
            MATCH (influencer:Utilisateur {email: '${email}'})
            MATCH p = (follower:Utilisateur)-[:FOLLOWS*1..${lvl}]->(influencer)
            WITH follower, min(length(p)) AS niveau
            MATCH (follower)-[cmd:A_COMMANDÉ]->(produit:Produit)
            RETURN niveau,
                produit.nom AS produit,
                count(cmd) AS nbCommandes,
                collect(DISTINCT follower.email) AS acheteurs
            ORDER BY niveau, nbCommandes DESC
        `;
        const result = await session.run(query, { email, lvl });

        const data = result.records.map(record => ({
            niveau: record.get('niveau'),
            produit: record.get('produit'),
            nbCommandes: record.get('nbCommandes').toNumber ? record.get('nbCommandes').toNumber() : record.get('nbCommandes'),
            acheteurs: record.get('acheteurs')
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur dans /api/produits-par-followers:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
}

module.exports = { getProduitsFollowers };