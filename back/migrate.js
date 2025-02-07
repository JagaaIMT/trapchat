const fs = require('fs');
const path = require('path');
const neo4j = require('neo4j-driver');

// Connexion à Neo4j
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));
const session = driver.session();

// Fonction pour exécuter une migration
async function runMigration(migrationFile) {
  const migrationQuery = fs.readFileSync(migrationFile, 'utf8');
  try {
    await session.run(migrationQuery);
    console.log(`Migration ${migrationFile} exécutée avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la migration ${migrationFile}:`, error);
  }
}

// Fonction pour exécuter toutes les migrations
async function runMigrations() {
  const migrationsDir = path.join('./database/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const migrationFile of migrationFiles) {
    const filePath = path.join(migrationsDir, migrationFile);
    await runMigration(filePath);
  }

  // Fermer la session et le driver
  await session.close();
  await driver.close();
}

// Exécuter les migrations
runMigrations().catch(console.error);
