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
    try {
        const startTime = process.hrtime();
        const query = `
        WITH RECURSIVE influencer AS (
          SELECT utilisateur_id, email
          FROM utilisateurs
          WHERE email = ?
        ),
        direct_orders AS (
          SELECT 0 AS niveau,
                 COUNT(co.commande_id) AS nbAcheteurs
          FROM influencer i
          LEFT JOIN commandes co ON co.utilisateur_id = i.utilisateur_id
          WHERE co.produit_id = ?
        ),
        cte AS (
          SELECT f.follower_id, 1 AS level
          FROM follows f
          WHERE f.utilisateur_id = (SELECT utilisateur_id FROM utilisateurs WHERE email = ?)
          UNION ALL
          SELECT f.follower_id, cte.level + 1 AS level
          FROM cte
          JOIN follows f ON f.utilisateur_id = cte.follower_id
          WHERE cte.level < ?
        ),
        min_levels AS (
          SELECT follower_id, MIN(level) AS niveau
          FROM cte
          GROUP BY follower_id
        ),
        followers_orders AS (
          SELECT ml.niveau,
                 COUNT(DISTINCT co.utilisateur_id) AS nbAcheteurs
          FROM min_levels ml
          JOIN commandes co ON co.utilisateur_id = ml.follower_id
          WHERE co.produit_id = ?
          GROUP BY ml.niveau
        )
        SELECT * FROM direct_orders
        UNION ALL
        SELECT * FROM followers_orders
        ORDER BY niveau;
      `;
        // Paramètres dans l'ordre : email, productId, email, lvl, productId
        const params = [email, productId, email, lvl, productId];
        const rows = await pool.query(query, params);

        // Conversion des BigInt
        const fixedRows = rows.map(row => {
            for (let key in row) {
                if (typeof row[key] === 'bigint') {
                    row[key] = Number(row[key]);
                }
            }
            return row;
        });

        const diff = process.hrtime(startTime);
        return res.status(200).json({data: fixedRows, duration: diff});
    } catch (error) {
        console.error('Erreur dans getProduitViralMaria:', error);
        return res.status(500).json({ error: error.message });
    }
}


async function getProduitViralNeo4j(email, productId, lvl, res) {
    if (!email || !productId || !lvl) {
        return res.status(400).json({ error: 'Les paramètres "email" et "produit id" ou "lvl" sont requis.' });
    }

    const session = driver.session();
    try {
        const startTime = process.hrtime();
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

        const diff = process.hrtime(startTime);
        return res.status(200).json({data: data, duration: diff});
    } catch (error) {
        console.error('Erreur dans /api/commande-par-niveau:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
}



module.exports = { getProduitViral };