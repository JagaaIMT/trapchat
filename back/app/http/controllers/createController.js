const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function createEntities(req, res) {
    const { base } = req.params;
    const { freq, nbUsers, nbFollowers, nbProduits, nbCommandes } = req.body;
    const commitFreq = parseInt(freq, 10) || 100;
    console.log('freq:', commitFreq, 'nbUsers:', nbUsers, 'nbFollowers:', nbFollowers, 'nbProduits:', nbProduits, 'nbCommandes:', nbCommandes);

    if(!nbUsers || !nbFollowers || !nbProduits || !nbCommandes) {
        return res.status(400).json({ error: 'Veuillez fournir les paramètres nécessaires' });
    }

    if (base === 'mariadb') {
            return createEntitiesMaria(commitFreq, nbUsers, nbFollowers, nbProduits, nbCommandes, res);
        } else if (base === 'neo4j') {
            return createEntitiesNeo4j(commitFreq, nbUsers, nbFollowers, nbProduits, nbCommandes, res);
        }
    return res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
}

/* ────────────────  MARIADB  ──────────────── */
const createEntitiesMaria = async (commitFreq, nbUsers, nbFollowers, nbProduits, nbCommandes, res) => {
    let conn;
    const startTime = process.hrtime();
    try {
        conn = await pool.getConnection();

        // 1️⃣ Insertion des nouveaux utilisateurs en batch
        for (let i = 0; i < nbUsers; i += commitFreq) {
            const batchSize = Math.min(commitFreq, nbUsers - i);
            let userPlaceholders = [];
            let userValues = [];
            for (let j = i; j < i + batchSize; j++) {
                const uniqueEmail = `email${Date.now()}_${j}@example.com`;
                userPlaceholders.push("(?, ?)");
                userValues.push(`User_${j}`, uniqueEmail);
            }
            const insertUsersSQL = `INSERT INTO utilisateurs (nom, email) VALUES ${userPlaceholders.join(", ")}`;
            await conn.beginTransaction();
            await conn.query(insertUsersSQL, userValues);
            await conn.commit();
        }
        console.log(`✅ ${nbUsers} nouveaux utilisateurs insérés.`);

        // Récupérer la liste de tous les utilisateurs (existants ET nouveaux)
        const allUsers = await conn.query("SELECT utilisateur_id FROM utilisateurs");
        const allUserIds = allUsers.map(u => u.utilisateur_id);
        // Si vous souhaitez n'utiliser que les nouveaux utilisateurs (par exemple si leur email suit un motif particulier),
        // vous pouvez filtrer par email : 
        // const [newUsers] = await conn.query("SELECT utilisateur_id FROM utilisateurs WHERE email LIKE 'email%@example.com'");
        // const newUserIds = newUsers.map(u => u.utilisateur_id);
        // Ici, nous utilisons la liste complète pour créer des relations.

        // 2️⃣ Insertion des relations de follow en batch  
        // Pour chaque **nouveau** utilisateur, on va créer nbFollowers relations vers un utilisateur aléatoire
        let followValues = [];
        // On suppose ici que vous voulez que chaque nouveau utilisateur (par exemple, ceux dont l'email commence par "email")
        // suive un certain nombre de personnes parmi tous les utilisateurs existants.
        const newUsers = await conn.query("SELECT utilisateur_id FROM utilisateurs WHERE email LIKE 'email%@example.com'");
        const newUserIds = newUsers.map(u => u.utilisateur_id);
        for (let userId of newUserIds) {
            const followersSet = new Set();
            while (followersSet.size < nbFollowers) {
                // Choisir aléatoirement parmi TOUS les utilisateurs
                const randomFollowee = allUserIds[Math.floor(Math.random() * allUserIds.length)];
                if (userId !== randomFollowee && !followersSet.has(`${userId}-${randomFollowee}`)) {
                    followersSet.add(`${userId}-${randomFollowee}`);
                    // Notez : selon votre modèle, vous devez vérifier l'ordre des colonnes.
                    // Ici, j’utilise (utilisateur_id, follower_id) pour indiquer "l'utilisateur suit le follower".
                    followValues.push(userId, randomFollowee);
                }
            }
        }
        const totalFollows = followValues.length / 2;
        for (let i = 0; i < totalFollows; i += commitFreq) {
            const batchCount = Math.min(commitFreq, totalFollows - i);
            const batchValues = followValues.slice(i * 2, (i + batchCount) * 2);
            let batchPlaceholders = [];
            for (let j = 0; j < batchCount; j++) {
                batchPlaceholders.push("(?, ?)");
            }
            const insertFollowsSQL = `INSERT IGNORE INTO follows (utilisateur_id, follower_id) VALUES ${batchPlaceholders.join(", ")}`;
            await conn.beginTransaction();
            await conn.query(insertFollowsSQL, batchValues);
            await conn.commit();
        }
        console.log(`✅ Relations de follow insérées.`);

        // 3️⃣ Insertion des nouveaux produits en batch
        for (let i = 0; i < nbProduits; i += commitFreq) {
            const batchSize = Math.min(commitFreq, nbProduits - i);
            let productPlaceholders = [];
            let productValues = [];
            for (let j = i; j < i + batchSize; j++) {
                productPlaceholders.push("(?)");
                productValues.push(`Produit_${j}_${Date.now()}`);
            }
            const insertProductsSQL = `INSERT INTO produits (nom_produit) VALUES ${productPlaceholders.join(", ")}`;
            await conn.beginTransaction();
            await conn.query(insertProductsSQL, productValues);
            await conn.commit();
        }
        console.log(`✅ ${nbProduits} nouveaux produits insérés.`);

        // Récupérer la liste complète des produits (existants ET nouveaux)
        const allProducts = await conn.query("SELECT produit_id FROM produits");
        const productIds = allProducts.map(p => p.produit_id);

        // 4️⃣ Insertion des commandes en batch  
        // Pour chaque **nouveau** utilisateur, créer nbCommandes commandes avec des produits aléatoires parmi tous les produits existants.
        let commandValues = [];
        for (let userId of newUserIds) {
            for (let i = 0; i < nbCommandes; i++) {
                const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
                const randomDateAchat = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                commandValues.push(userId, randomProductId, randomDateAchat);
            }
        }
        const totalCommands = newUserIds.length * nbCommandes;
        for (let i = 0; i < totalCommands; i += commitFreq) {
            const batchCount = Math.min(commitFreq, totalCommands - i);
            const batchValues = commandValues.slice(i * 3, (i + batchCount) * 3);
            let batchPlaceholders = [];
            for (let j = 0; j < batchCount; j++) {
                batchPlaceholders.push("(?, ?, ?)");
            }
            const insertCommandsSQL = `INSERT INTO commandes (utilisateur_id, produit_id, date_achat) VALUES ${batchPlaceholders.join(", ")}`;
            await conn.beginTransaction();
            await conn.query(insertCommandsSQL, batchValues);
            await conn.commit();
        }
        console.log(`✅ ${totalCommands} commandes insérées.`);

        const diff = process.hrtime(startTime);
        const durationMs = diff[0] * 1000 + diff[1] / 1e6;
        console.log(`Temps d'exécution : ${durationMs.toFixed(2)} ms`);
        res.status(200).json({ message: 'Données insérées avec succès', duration: durationMs.toFixed(2) });
    } catch (err) {
        console.error('Erreur lors de l’insertion des données :', err);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
    } finally {
        if (conn) conn.release();
    }
};

/* ────────────────  NEO4J  ──────────────── */
const createEntitiesNeo4j = async (commitFreq, nbUsers, nbFollowers, nbProduits, nbCommandes, res) => {
    const neoSession = driver.session();
    const startTime = process.hrtime();

    try {
        // 1️⃣ Création des nouveaux utilisateurs
        let newUserEmails = [];
        let tx = neoSession.beginTransaction();
        for (let i = 0; i < nbUsers; i++) {
            const uniqueEmail = `email${Date.now()}_${i}@example.com`;
            const userName = `User_${i}`;
            const query = `
          CREATE (u:Utilisateur {id: apoc.create.uuid(), nom: $nom, email: $email})
          RETURN u.email AS email
        `;
            const result = await tx.run(query, { nom: userName, email: uniqueEmail });
            newUserEmails.push(result.records[0].get("email"));
            if ((i + 1) % commitFreq === 0) {
                await tx.commit();
                tx = neoSession.beginTransaction();
            }
        }
        await tx.commit();
        console.log(`✅ ${nbUsers} nouveaux utilisateurs insérés dans Neo4j.`);

        // 2️⃣ Récupérer la liste complète des utilisateurs (existants + nouveaux)
        const allUsersResult = await neoSession.run(`MATCH (u:Utilisateur) RETURN u.email AS email`);
        const allUserEmails = allUsersResult.records.map(record => record.get("email"));
        console.log(`✅ Nombre total d'utilisateurs dans la base : ${allUserEmails.length}`);

        // 3️⃣ Création des relations de FOLLOWS pour chaque nouvel utilisateur
        for (let email of newUserEmails) {
            let followsSet = new Set();
            let txFollow = neoSession.beginTransaction();
            let count = 0;
            while (followsSet.size < nbFollowers) {
                // Choix aléatoire parmi tous les utilisateurs existants
                const randomEmail = allUserEmails[Math.floor(Math.random() * allUserEmails.length)];
                if (randomEmail !== email && !followsSet.has(`${email}-${randomEmail}`)) {
                    followsSet.add(`${email}-${randomEmail}`);
                    const followQuery = `
              MATCH (a:Utilisateur {email: $emailA}), (b:Utilisateur {email: $emailB})
              CREATE (a)-[:FOLLOWS]->(b)
            `;
                    await txFollow.run(followQuery, { emailA: email, emailB: randomEmail });
                    count++;
                    if (count % commitFreq === 0) {
                        await txFollow.commit();
                        txFollow = neoSession.beginTransaction();
                    }
                }
            }
            await txFollow.commit();
        }
        console.log(`✅ Relations de FOLLOWS créées pour les nouveaux utilisateurs.`);

        // 4️⃣ Insertion des nouveaux produits
        let newProductNames = [];
        let txProd = neoSession.beginTransaction();
        for (let i = 0; i < nbProduits; i++) {
            const productName = `Produit_${i}_${Date.now()}`;
            const productQuery = `
          CREATE (p:Produit {id: apoc.create.uuid(), nom: $nom})
          RETURN p.nom AS nom
        `;
            const result = await txProd.run(productQuery, { nom: productName });
            newProductNames.push(result.records[0].get("nom"));
            if ((i + 1) % commitFreq === 0) {
                await txProd.commit();
                txProd = neoSession.beginTransaction();
            }
        }
        await txProd.commit();
        console.log(`✅ ${nbProduits} nouveaux produits insérés dans Neo4j.`);

        // 5️⃣ Récupérer la liste complète des produits (existants + nouveaux)
        const allProductsResult = await neoSession.run(`MATCH (p:Produit) RETURN p.nom AS nom`);
        const allProductNames = allProductsResult.records.map(record => record.get("nom"));
        console.log(`✅ Nombre total de produits dans la base : ${allProductNames.length}`);

        // 6️⃣ Insertion des commandes (A_COMMANDÉ)
        let txCmd = neoSession.beginTransaction();
        let countCmd = 0;
        for (let email of newUserEmails) {
            for (let i = 0; i < nbCommandes; i++) {
                const randomProduct = allProductNames[Math.floor(Math.random() * allProductNames.length)];
                const randomDateAchat = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
                const commandeQuery = `
            MATCH (u:Utilisateur {email: $email}), (p:Produit {nom: $nom})
            CREATE (u)-[:A_COMMANDÉ {date_achat: $dateAchat}]->(p)
          `;
                await txCmd.run(commandeQuery, { email, nom: randomProduct, dateAchat: randomDateAchat });
                countCmd++;
                if (countCmd % commitFreq === 0) {
                    await txCmd.commit();
                    txCmd = neoSession.beginTransaction();
                }
            }
        }
        await txCmd.commit();
        console.log(`✅ Commandes insérées dans Neo4j.`);

        // Calcul du temps d'exécution
        const diff = process.hrtime(startTime);
        const durationMs = diff[0] * 1000 + diff[1] / 1e6;
        console.log(`Temps d'exécution : ${durationMs.toFixed(2)} ms`);
        res.status(200).json({ message: 'Données insérées avec succès dans Neo4j', duration: durationMs.toFixed(2) });

    } catch (err) {
        console.error("❌ Erreur lors de l'insertion dans Neo4j :", err);
        res.status(500).json({ error: 'Erreur lors de l’insertion des données dans Neo4j' });
    } finally {
        await neoSession.close();
    }
};


module.exports = { createEntities };