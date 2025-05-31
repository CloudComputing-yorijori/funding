const express = require('express');
const router = express.Router();
db = require("../models/index");
const fundingController = require('../controllers/fundingController');
// const authenticateJWT = require('../middlewares/authMiddleware');

// 마이페이지: 내가 참여한 펀딩
router.get('/participated', fundingController.getParticipatedFundings);

// 마이페이지: 내가 연 펀딩
router.get('/opened', fundingController.getOpenedFundings);

module.exports = router;
