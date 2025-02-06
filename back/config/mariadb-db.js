// config/db.js
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD, 
    database: process.env.DATABASE,
    connectionLimit: process.env.CONNECTION_LIMIT,
});

module.exports = pool;


