// const express = require('express');
// const jwt = require('jsonwebtoken');
// const router = express.Router();

// // 테스트용 JWT 발급 (모든 유저 정보 포함)
// router.get('/get-test-token', (req, res) => {
//   const dummyUser = {
//     userId: 42,
//     email: 'test@example.com',
//     name: '임예은',
//     nickname: '옌',
//     phoneNumber: '010-1234-5678',
//     city: '서울',
//     district: '강남구',
//     town: '신사동',
//     detail: '123-45',
//     imageUrl: 'https://example.com/profile.png'
//   };

//   const token = jwt.sign(dummyUser, 'yorijori_secret', { expiresIn: '6h' });

//   res.json({ token });
// });
// router.get('/test', (req, res) => {
//     res.render('funding/test'); // test.ejs를 렌더링
//   });
// module.exports = router;

const express = require('express');
const router = express.Router();

// 세션에 임시 로그인 정보 주입
router.get('/mock-login', (req, res) => {
req.session.user = {
    userId: 1,                    // 모델 상에서 userId가 기본 PK
    email: 'test@example.com',
    name: '홍길동',
    nickname: '길동이',
    phoneNumber: '010-1234-5678',
    city: '서울특별시',
    district: "서초구",
    town: '방배동',
    detail: '테스트 상세 주소',
    imageUrl: '/images/test-user.png'
};

console.log("[Mock Login] 세션 생성됨:", req.session.user);
res.send({ message: "Mock login successful", user: req.session.user });
});

// 세션 확인용 엔드포인트
router.get('/check-session', (req, res) => {
if (req.session.user) {
    res.send({ message: "Session active", user: req.session.user });
  } else {
    res.status(401).send({ message: "No active session" });
  }
 });
 
 module.exports = router;
  