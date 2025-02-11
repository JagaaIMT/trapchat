const express = require('express');
const { getProduitsFollowers } = require('../app/http/controllers/getProduitsFollowersController');
const { getProduitFollowersByProduct } = require('../app/http/controllers/getProduitFollowersByProductController');
const { getProduitViral } = require('../app/http/controllers/getProduitViralController');
const router = express.Router();

router.get('/:base/products-followers/:email/:lvl', getProduitsFollowers);
router.get('/:base/products-followers-product/:email/:productId/:lvl', getProduitFollowersByProduct);
router.get('/:base/products-viral/:email/:productId/:lvl', getProduitViral);

module.exports = router;