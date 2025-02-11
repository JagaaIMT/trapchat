require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  `bolt://${process.env.NEO4J_HOST}:7687`,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

describe('Test de connexion à Neo4j', () => {
  let session;

  beforeAll(() => {
    session = driver.session();
  });

  afterAll(async () => {
    await session.close();
    await driver.close();
  });

  test('La connexion à Neo4j doit réussir', async () => {
    try {
      const result = await session.run('RETURN 1 AS test');
      const record = result.records[0];
    } catch (error) {
      throw new Error('Connexion à Neo4j échouée : ' + error.message);
    }
  });
});
