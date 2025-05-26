const express = require('express');
const router = express.Router();
db = require("../models/index");
const joinFundingController = require("../controllers/joinFundingController");
const authenticateJWT = require('../middlewares/authMiddleware');
  

router.get("/fundingPage", authenticateJWT, joinFundingController.fundingList ,joinFundingController.getFundingPage);//펀딩페이지
router.get("/fundingSearch", authenticateJWT,joinFundingController.fundingSearch, joinFundingController.getFundingSearch ); //펀딩검색페이지
router.get("/joinFunding/:groupId", authenticateJWT, joinFundingController.joinFunding, joinFundingController.getJoinFunding); //펀딩참여페이지
router.get("/joinFunding/:groupId/join", authenticateJWT, joinFundingController.joinFunding, joinFundingController.getJoinFundingClick); //펀딩참여확인페이지
router.get("/joinFundingComplete/:groupId/complete", authenticateJWT, joinFundingController.joinFunding, joinFundingController.joinRequest,  joinFundingController.getJoinFundingComplete); //펀딩완료페이지
router.get("/cancleFunding/:groupId", authenticateJWT, joinFundingController.cancleFunding);
module.exports = router;