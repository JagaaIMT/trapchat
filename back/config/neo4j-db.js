const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
dotenv.config();

const driver = neo4j.driver(
  'bolt://neo4j:7687',
  neo4j.auth.basic('neo4j', 'password'),
  { encrypted: 'ENCRYPTION_OFF' }
);

const session = driver.session();

module.exports = { session, driver };


