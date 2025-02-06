require('dotenv').config();

const express = require('express')
const app = express()
const pool = require('./config/mariadb-db');
const { session } = require('./config/neo4j-db');
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
