require('dotenv').config();

const express = require('express')
const app = express()
const pool = require('./config/mariadb-db');
// const { session } = require('./config/neo4j-db');
const createRoutes = require('./routes/createRoutes');
const port = 3000

app.use(express.json()); 

app.use('/api', createRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
