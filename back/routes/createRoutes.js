const express = require('express');
const { createEntities } = require('../app/http/controllers/createController');
const router = express.Router();

router.post('/create', createEntities);

module.exports = router;