const fs = require('fs');
const path = require('path');
const neo4j = require('neo4j-driver');

// Connexion à Neo4j
// const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));

const driver = neo4j.driver(
  'bolt://neo4j:7687', 
  neo4j.auth.basic('neo4j', 'password'),
  { encrypted: 'ENCRYPTION_OFF' }
);

const session = driver.session();

async function runMigration(migrationFile) {
  const migrationQuery = fs.readFileSync(migrationFile, 'utf8');
  const session = driver.session();
  try {
    await session.run(migrationQuery);
    console.log(`Migration ${migrationFile} exécutée avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la migration ${migrationFile}:`, error);
  } finally {
    await session.close();
  }
}

async function runMigrations() {
  const migrationsDir = path.join('./database/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const migrationFile of migrationFiles) {
    const filePath = path.join(migrationsDir, migrationFile);
    await runMigration(filePath);
  }

  await driver.close();
}

runMigrations().catch(console.error);

