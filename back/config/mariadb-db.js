const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',      // Adresse de ton serveur MariaDB
    user: 'root',           // Ton utilisateur MariaDB
    password: 'password',   // Ton mot de passe MariaDB
    database: 'testdb',     // Nom de la base de données
    connectionLimit: 5      // Limite de connexions simultanées
});

module.exports = pool;