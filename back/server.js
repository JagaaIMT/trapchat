require('dotenv').config();

const express = require('express')
const app = express()
const createRoutes = require('./routes/createRoutes');
const requestRoutes = require('./routes/requestRoutes');
const port = 3000

app.use(express.json()); 

app.use('/api', createRoutes);
app.use('/api', requestRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
