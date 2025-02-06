const express = require('express')
const app = express()
const pool = require('./config/mariadb-db');
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})