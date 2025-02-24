const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

/**
 * Fonction principale : génère un objet "data" avec les nouveaux utilisateurs et produits,
 * puis appelle la fonction d'insertion correspondant à la base ("mariadb" ou "neo4j").
 */
async function createEntities(req, res) {
  const { base } = req.params;
  const { freq, nbUsers, nbFollowers, nbProduits, nbCommandes } = req.body;
  const commitFreq = parseInt(freq, 10) || 100;
  console.log('freq:', commitFreq, 'nbUsers:', nbUsers, 'nbFollowers:', nbFollowers, 'nbProduits:', nbProduits, 'nbCommandes:', nbCommandes);

  if (!nbUsers || !nbFollowers || !nbProduits || !nbCommandes) {
    return res.status(400).json({ error: 'Veuillez fournir les paramètres nécessaires' });
  }

  // Génération des nouveaux utilisateurs avec des données identiques pour les deux bases
  const newUsers = [];
  for (let i = 0; i < nbUsers; i++) {
    newUsers.push({
      name: `User_${Date.now()}_${i}`,
      email: `email${Date.now()}_${i}@example.com`
    });
  }

  // Génération des nouveaux produits
  const newProducts = [];
  for (let i = 0; i < nbProduits; i++) {
    newProducts.push({
      name: `Produit${Date.now()}_${i}`
    });
  }

  // Construction de l'objet data qui sera transmis aux fonctions d'insertion
  const data = { newUsers, newProducts, nbFollowers, nbCommandes };

  if (base === 'mariadb') {
    return createEntitiesMaria(commitFreq, data, res);
  } else if (base === 'neo4j') {
    return createEntitiesNeo4j(commitFreq, data, res);
  }
  return res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
}

/* ────────────────  MARIADB  ──────────────── */
const createEntitiesMaria = async (commitFreq, data, res) => {
  let conn;
  const startTime = process.hrtime();
  try {
    conn = await pool.getConnection();

    // 1️⃣ Insertion des nouveaux utilisateurs en batch
    const newUsers = data.newUsers;
    for (let i = 0; i < newUsers.length; i += commitFreq) {
      const batch = newUsers.slice(i, i + commitFreq);
      const placeholders = batch.map(() => "(?, ?)").join(", ");
      const values = [];
      for (const user of batch) {
        values.push(user.name, user.email);
      }
      const insertUsersSQL = `INSERT INTO utilisateurs (nom, email) VALUES ${placeholders}`;
      await conn.beginTransaction();
      await conn.query(insertUsersSQL, values);
      await conn.commit();
    }
    console.log(`✅ ${newUsers.length} nouveaux utilisateurs insérés.`);

    // 2️⃣ Récupérer la liste de tous les utilisateurs (existants ET nouveaux)
    const allUsers = await conn.query("SELECT utilisateur_id, email FROM utilisateurs");
    const allUserIds = allUsers.map(u => u.utilisateur_id);
    // On récupère les utilisateurs nouvellement insérés via le pattern d'email
    const newUserRecords = await conn.query("SELECT utilisateur_id, email FROM utilisateurs WHERE email LIKE 'email%@example.com'");
    const newUserIds = newUserRecords.map(u => u.utilisateur_id);

    // 3️⃣ Insertion des relations de follow en batch
    let followValues = [];
    // Pour chaque nouvel utilisateur, on génère nbFollowers relations vers un utilisateur aléatoire (dans la liste complète)
    for (let userId of newUserIds) {
      const followersSet = new Set();
      while (followersSet.size < data.nbFollowers) {
        const randomFollowee = allUserIds[Math.floor(Math.random() * allUserIds.length)];
        if (userId !== randomFollowee && !followersSet.has(`${userId}-${randomFollowee}`)) {
          followersSet.add(`${userId}-${randomFollowee}`);
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

    // 4️⃣ Insertion des nouveaux produits en batch
    const newProducts = data.newProducts;
    for (let i = 0; i < newProducts.length; i += commitFreq) {
      const batch = newProducts.slice(i, i + commitFreq);
      const placeholders = batch.map(() => "(?)").join(", ");
      const values = batch.map(product => product.name);
      const insertProductsSQL = `INSERT INTO produits (nom_produit) VALUES ${placeholders}`;
      await conn.beginTransaction();
      await conn.query(insertProductsSQL, values);
      await conn.commit();
    }
    console.log(`✅ ${newProducts.length} nouveaux produits insérés.`);

    // 5️⃣ Récupérer la liste complète des produits (existants ET nouveaux)
    const allProducts = await conn.query("SELECT produit_id, nom_produit FROM produits");
    const productIds = allProducts.map(p => p.produit_id);

    // 6️⃣ Insertion des commandes en batch pour chaque nouvel utilisateur
    let orderValues = [];
    for (let userId of newUserIds) {
      for (let i = 0; i < data.nbCommandes; i++) {
        const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
        const dateAchat = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
        orderValues.push(userId, randomProductId, dateAchat);
      }
    }
    const totalOrders = newUserIds.length * data.nbCommandes;
    for (let i = 0; i < totalOrders; i += commitFreq) {
      const batchCount = Math.min(commitFreq, totalOrders - i);
      const batchValues = orderValues.slice(i * 3, (i + batchCount) * 3);
      let batchPlaceholders = [];
      for (let j = 0; j < batchCount; j++) {
        batchPlaceholders.push("(?, ?, ?)");
      }
      const insertOrdersSQL = `INSERT INTO commandes (utilisateur_id, produit_id, date_achat) VALUES ${batchPlaceholders.join(", ")}`;
      await conn.beginTransaction();
      await conn.query(insertOrdersSQL, batchValues);
      await conn.commit();
    }
    console.log(`✅ ${totalOrders} commandes insérées.`);

    const diff = process.hrtime(startTime);
    const durationSec = diff[0] + diff[1] / 1e9;
    res.status(200).json({ message: 'Données insérées avec succès', duration: durationSec.toFixed(2) });
  } catch (err) {
    console.error('Erreur lors de l’insertion des données :', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Erreur lors de l’insertion des données' });
  } finally {
    if (conn) conn.release();
  }
};

/* ────────────────  NEO4J  ──────────────── */
const createEntitiesNeo4j = async (commitFreq, data, res) => {
  const neoSession = driver.session();
  const startTime = process.hrtime();

  try {
    // 1️⃣ Insertion des nouveaux utilisateurs en utilisant data.newUsers
    let newUserEmails = [];
    let tx = neoSession.beginTransaction();
    for (let user of data.newUsers) {
      const query = `
        CREATE (u:Utilisateur {id: apoc.create.uuid(), nom: $nom, email: $email})
        RETURN u.email AS email
      `;
      const result = await tx.run(query, { nom: user.name, email: user.email });
      newUserEmails.push(result.records[0].get("email"));
      if (newUserEmails.length % commitFreq === 0) {
        await tx.commit();
        tx = neoSession.beginTransaction();
      }
    }
    await tx.commit();
    console.log(`✅ ${data.newUsers.length} nouveaux utilisateurs insérés dans Neo4j.`);

    // 2️⃣ Récupérer la liste complète des utilisateurs (existants ET nouveaux)
    const allUsersResult = await neoSession.run(`MATCH (u:Utilisateur) RETURN u.email AS email`);
    const allUserEmails = allUsersResult.records.map(record => record.get("email"));
    console.log(`✅ Nombre total d'utilisateurs dans Neo4j : ${allUserEmails.length}`);

    // 3️⃣ Création des relations FOLLOWS pour chaque nouvel utilisateur
    for (let email of newUserEmails) {
      let followsSet = new Set();
      let txFollow = neoSession.beginTransaction();
      let count = 0;
      while (followsSet.size < data.nbFollowers) {
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
    console.log(`✅ Relations de FOLLOWS créées dans Neo4j.`);

    // 4️⃣ Insertion des nouveaux produits en utilisant data.newProducts
    let newProductNames = [];
    let txProd = neoSession.beginTransaction();
    for (let product of data.newProducts) {
      const productQuery = `
        CREATE (p:Produit {id: apoc.create.uuid(), nom: $nom})
        RETURN p.nom AS nom
      `;
      const result = await txProd.run(productQuery, { nom: product.name });
      newProductNames.push(result.records[0].get("nom"));
      if (newProductNames.length % commitFreq === 0) {
        await txProd.commit();
        txProd = neoSession.beginTransaction();
      }
    }
    await txProd.commit();
    console.log(`✅ ${data.newProducts.length} nouveaux produits insérés dans Neo4j.`);

    // 5️⃣ Récupérer la liste complète des produits (existants ET nouveaux)
    const allProductsResult = await neoSession.run(`MATCH (p:Produit) RETURN p.nom AS nom`);
    const allProductNames = allProductsResult.records.map(record => record.get("nom"));
    console.log(`✅ Nombre total de produits dans Neo4j : ${allProductNames.length}`);

    // 6️⃣ Insertion des commandes (A_COMMANDÉ) pour chaque nouvel utilisateur
    let txCmd = neoSession.beginTransaction();
    let countCmd = 0;
    for (let email of newUserEmails) {
      for (let i = 0; i < data.nbCommandes; i++) {
        const randomProduct = allProductNames[Math.floor(Math.random() * allProductNames.length)];
        const randomDateAchat = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
        const orderQuery = `
          MATCH (u:Utilisateur {email: $email}), (p:Produit {nom: $nom})
          CREATE (u)-[:A_COMMANDÉ {date_achat: $dateAchat}]->(p)
        `;
        await txCmd.run(orderQuery, { email, nom: randomProduct, dateAchat: randomDateAchat });
        countCmd++;
        if (countCmd % commitFreq === 0) {
          await txCmd.commit();
          txCmd = neoSession.beginTransaction();
        }
      }
    }
    await txCmd.commit();
    console.log(`✅ Commandes insérées dans Neo4j.`);

    const diff = process.hrtime(startTime);
    const durationSec = diff[0] + diff[1] / 1e9;
    res.status(200).json({ message: 'Données insérées avec succès dans Neo4j', duration: durationSec.toFixed(2) });
  } catch (err) {
    console.error("❌ Erreur lors de l'insertion dans Neo4j :", err);
    res.status(500).json({ error: 'Erreur lors de l’insertion des données dans Neo4j' });
  } finally {
    await neoSession.close();
  }
};

module.exports = { createEntities };