const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
dotenv.config();

const driver = neo4j.driver(
  `bolt://${process.env.NEO4J_HOST}:7687`,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

module.exports = { session, driver };
