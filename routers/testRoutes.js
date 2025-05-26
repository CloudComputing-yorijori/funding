const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 테스트용 JWT 발급 (모든 유저 정보 포함)
router.get('/get-test-token', (req, res) => {
  const dummyUser = {
    userId: 42,
    email: 'test@example.com',
    name: '임예은',
    nickname: '옌',
    phoneNumber: '010-1234-5678',
    city: '서울',
    district: '강남구',
    town: '신사동',
    detail: '123-45',
    imageUrl: 'https://example.com/profile.png'
  };

  const token = jwt.sign(dummyUser, 'yorijori_secret', { expiresIn: '6h' });

  res.json({ token });
});
router.get('/test', (req, res) => {
    res.render('funding/test'); // test.ejs를 렌더링
  });
module.exports = router;