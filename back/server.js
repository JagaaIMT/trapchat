require('dotenv').config();

const express = require('express')
const app = express()
const createRoutes = require('./routes/createRoutes');
const requestRoutes = require('./routes/requestRoutes');
const searchRoutes = require('./routes/searchRoutes');
const port = 3000;
const cors = require('cors');

const corsOptions = {
    origin: '*',
};

app.use(express.json());

app.use(cors(corsOptions));
app.use('/api', createRoutes);
app.use('/api', requestRoutes);
app.use('/api', searchRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
