const express = require('express');
const router = express.Router();
db = require("../models/index");
const createFundingController = require("../controllers/createFundingController.js");
const authenticateJWT = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer(); 

router.get('/create_funding_search', createFundingController.showCreateFundingSearchPage);
router.get('/search_results', createFundingController.searchProducts);
router.get('/product_detail/:productId', createFundingController.productDetail);
router.get('/create_funding/:productId', authenticateJWT, createFundingController.showCreateFundingPage);
router.post('/create_funding/:productId', authenticateJWT, upload.none(), createFundingController.createFunding);
router.get('/create_funding_success/:fundingGroupId', authenticateJWT, createFundingController.showCreateFundingSuccessPage);

module.exports = router;