const pool = require('../../../config/mariadb-db');
const { driver } = require('../../../config/neo4j-db');

async function searchEmails(req, res) {
    const { base, email, productId } = req.params;
    console.log('base', base, 'email', email, 'productId', productId);
    if (base === 'mariadb') {
        return getEmailsMariadb(email, res);
    } else if (base === 'neo4j') {
        return getEmailsneo4j(email, res);
    }
    return res.status(500).json({ error: 'Erreur lors de la recherche.' });
}

const getEmailsMariadb = async (email, res) => {
    try {
        let query, params;
        if (!email) {
            query = `SELECT * FROM utilisateurs LIMIT 10`;
            params = [];
        } else {
            query = `SELECT * FROM utilisateurs WHERE email LIKE CONCAT('%', ?, '%') LIMIT 10`;
            params = [email];
        }
        const result = await pool.query(query, params);
        const emails = result.map(record => record.email);
        return res.status(200).json({ data: emails });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getEmailsneo4j = async (email, res) => {
    const session = driver.session();
    try {
        let cypherQuery, params;
        if (!email) {
            cypherQuery = `
                MATCH (u:Utilisateur)
                RETURN u.email AS email
                LIMIT 10
            `;
            params = {};
        } else {
            cypherQuery = `
                MATCH (u:Utilisateur)
                WHERE u.email CONTAINS $email
                RETURN u.email AS email
                LIMIT 10
            `;
            params = { email };
        }
        const result = await session.run(cypherQuery, params);
        const emails = result.records.map(record => record.get('email'));
        return res.status(200).json({ data: emails });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

module.exports = { searchEmails };