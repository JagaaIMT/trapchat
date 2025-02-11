const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function getProduitViral(req, res,) {
    const { base, email, productId, lvl } = req.params;
    console.log('base', base, 'email', email, 'productId', productId, 'lvl', lvl);

    if (base === 'mariadb') {
        return getProduitViralMaria(email, productId, lvl, res);
    } else if (base === 'neo4j') {
        return getProduitViralNeo4j(email, productId, lvl, res);
    }
    return res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
}

async function getProduitViralMaria(email, productId, lvl, res) {
    res.status(200).json({ message: 'Maria db' });
}

async function getProduitViralNeo4j(email, productId, lvl, res) {
    if (!email || !productId || !lvl) {
        return res.status(400).json({ error: 'Les paramètres "email" et "produit id" ou "lvl" sont requis.' });
    }

    const session = driver.session();
    try {
        const query = `
            // Partie 1 : Niveau 0 (l'influenceur lui-même)
            MATCH (influencer:Utilisateur {email: '${email}'})
            OPTIONAL MATCH (influencer)-[cmd0:A_COMMANDÉ]->(produit:Produit {id: '${productId}'})
            RETURN 0 AS niveau, count(cmd0) AS nbAcheteurs

            UNION

            // Partie 2 : Niveaux 1 et plus (les followers)
            MATCH (influencer:Utilisateur {email: '${email}'})
            MATCH p = (follower:Utilisateur)-[:FOLLOWS*1..${lvl}]->(influencer)
            WITH follower, min(length(p)) AS niveau
            MATCH (follower)-[cmd:A_COMMANDÉ]->(produit:Produit {id: '${productId}'})
            RETURN niveau, count(DISTINCT follower) AS nbAcheteurs

            ORDER BY niveau
        `;

        const result = await session.run(query, { email, lvl, productId });
        const data = result.records.map(record => ({
            niveau: record.get('niveau'),
            nbAcheteurs: record.get('nbAcheteurs').toNumber ? record.get('nbAcheteurs').toNumber() : record.get('nbAcheteurs')
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur dans /api/commande-par-niveau:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
}



module.exports = { getProduitViral };