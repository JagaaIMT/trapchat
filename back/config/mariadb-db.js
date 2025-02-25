const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

const pool = mariadb.createPool({
    host: "mariadb",
    user: "root",
    password: "root",
    database: "trapchat",
    connectionLimit: 10,
});

module.exports = pool;
