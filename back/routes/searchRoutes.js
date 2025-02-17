const express = require('express');
const { searchEmails } = require('../app/http/controllers/searchEmailsController');
const router = express.Router();

router.get('/:base/email/:email?', searchEmails);

module.exports = router;