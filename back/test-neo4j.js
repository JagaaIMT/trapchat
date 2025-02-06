require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  `bolt://${process.env.NEO4J_HOST}:7687`,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function testConnection() {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS test');
    const record = result.records[0];
    console.log('Connexion à Neo4j réussie !', record.get('test'));
  } catch (error) {
    console.error('Erreur lors de la connexion à Neo4j :', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

testConnection();