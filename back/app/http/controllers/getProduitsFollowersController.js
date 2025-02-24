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
    try {
        const startTime = process.hrtime();
        const query = `
        WITH RECURSIVE cte AS (
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
        )
        SELECT 
          ml.niveau,
          p.nom_produit AS produit,
          COUNT(co.commande_id) AS nbCommandes,
          GROUP_CONCAT(DISTINCT u.email SEPARATOR ', ') AS acheteurs
        FROM min_levels ml
        JOIN commandes co ON co.utilisateur_id = ml.follower_id
        JOIN produits p ON p.produit_id = co.produit_id
        JOIN utilisateurs u ON u.utilisateur_id = ml.follower_id
        GROUP BY ml.niveau, p.produit_id
        ORDER BY ml.niveau, nbCommandes DESC;
      `;
        // Paramètres : email, lvl
        const params = [email, lvl];
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
        const durationSec = diff[0] + diff[1] / 1e9;
        return res.status(200).json({ data: fixedRows, duration: durationSec });
    } catch (error) {
        console.error('Erreur dans getProduitsFollowersMaria:', error);
        return res.status(500).json({ error: error.message });
    }
}


async function getProduitsFollowersNeo4j(email, lvl, res) {
    if (!email || !lvl) {
        return res.status(400).json({ error: 'Le paramètre "email" ou "lvl" est requis.' });
    }

    const session = driver.session();

    try {
        const startTime = process.hrtime();
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

        const diff = process.hrtime(startTime);
        const durationSec = diff[0] + diff[1] / 1e9;
        return res.status(200).json({ data: data, duration: durationSec });
    } catch (error) {
        console.error('Erreur dans /api/produits-par-followers:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
}

module.exports = { getProduitsFollowers };