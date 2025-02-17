const express = require('express');
const { searchEmails } = require('../app/http/controllers/searchEmailsController');
const { searchProducts } = require('../app/http/controllers/searchProductsController');
const router = express.Router();

router.get('/:base/email/:email?', searchEmails);
router.get('/:base/product/:product?', searchProducts);

module.exports = router;