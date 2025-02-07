const express = require('express');
const { createEntities } = require('../app/http/controllers/createController');
const router = express.Router();

router.post('/:base/create', createEntities);

module.exports = router;