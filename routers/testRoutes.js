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

// const express = require('express');
// const router = express.Router();

// // 세션에 임시 로그인 정보 주입
// router.get('/mock-login', (req, res) => {
//   req.session.user = {
//     id: 1,              // 테스트용 사용자 ID
//     username: '홍길동', // 테스트용 이름
//     district: '강남구',
//     phoneNumber: "010-1234-5678"       // 필요에 따라 권한 필드 추가
//   };

//   console.log("[Mock Login] 세션 생성됨:", req.session.user);
//   res.send({ message: "Mock login successful", user: req.session.user });
// });

// // 세션 확인용 엔드포인트
// router.get('/check-session', (req, res) => {
//   if (req.session.user) {
//     res.send({ message: "Session active", user: req.session.user });
//   } else {
//     res.status(401).send({ message: "No active session" });
//   }
// });

// module.exports = router;

  