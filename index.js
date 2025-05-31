const express = require("express");
const layouts = require("express-ejs-layouts");
const db = require("./models/index");
const flash = require("connect-flash");
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fs = require("fs");
const path = require("path");

const app = express();


// db.sequelize.sync({});
// // 세션 설정
// app.use(session({
//     secret: 'yorijori_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     store: new FileStore()
// }));

app.use(flash());
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const cors = require('cors');

// core 오류 방지 설정
app.use(cors({
    origin: 'http://localhost:3000',
    
}));
    
//bodyParser 추가
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.use(layouts);
app.use(express.static('public')); // 정적 파일 사용

// 전역 변수 설정 (플래시 메시지를 모든 템플릿에서 사용할 수 있도록 설정)
// app.use((req, res, next) => {
//     res.locals.successMessages = req.flash("success");
//     res.locals.errorMessages = req.flash("error");
//     next();
//   })


// app.use((req, res, next) => {
//     res.locals.loggedIn = false;         // 임시 고정
//     res.locals.currentUser = req.user;   // JWT 미들웨어에서 넣은 값
//     res.locals.flashMessages = req.flash();
//     next();
// });


// 모든 요청 전에 실행되는 미들웨어
app.use((req, res, next) => {
    res.locals.showCategoryBar = false; // 기본적으로 카테고리 바를 표시하지 않음
    res.locals.showSubCategoryBar = false; // 기본적으로 세부 카테고리 바를 표시하지 않음
    next();
});


// Redis 관련 모듈 추가
const Redis = require("redis");
const { RedisStore } = require("connect-redis");

// Redis 클라이언트 생성
const redisClient = Redis.createClient({
    legacyMode: true, // Redis v4를 사용하는 경우, connect-redis 호환을 위해 legacy 모드 설정
    url: "redis://redis:6379", // 실제 Redis 서버 컨테이너와 일치해야 됨
  });
  redisClient.connect().catch(console.error);
  
// 세션 설정 (RedisStore 사용)
app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: "yorijori_secret_key",
      resave: false,
      saveUninitialized: false, // true면 로그인 안해도 세션 생성됨
      cookie: {
        secure: false, // HTTPS 환경에서는 true로 설정 필요
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1일
      },
    })
  );
  
  app.use((req, res, next) => {
    // 세션 로그인 여부
    res.locals.loggedIn = !!req.session.user;
    // 세션에서 현재 유저 정보 설정
    res.locals.currentUser = req.session.user || null;
    // flash 메시지 처리
    res.locals.flashMessages = req.flash();
    next();
  });
  
  

// Router
const joinFundingRouter = require("./routers/joinFundingRouter.js")
const createFundingRouter = require("./routers/createFundingRouter.js")
const fundingRouter = require("./routers/fundingRoutes.js");
const testRoutes = require('./routers/testRoutes'); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// home 접근
// app.use("/", homeRouter);
// createFundingRouter 접근
app.use("/createfundingPage", createFundingRouter);
// joinFundingRouter 접근
app.use("/joinfundingPage", joinFundingRouter);
// fundingRouter 접근
app.use("/funding", fundingRouter);
// test
app.use('/test', testRoutes);
// 서버 실행

db.sequelize.sync({ alter: true })  // 또는 { force: true } → 개발 중 사용 가능
  .then(() => {
    console.log("✅ Sequelize 테이블 동기화 완료");

    // 서버 실행
    app.set("port", 3001);
    app.listen(app.get("port"), "0.0.0.0", () => {
      console.log(` Server running at http://localhost:${app.get("port")}`);
    });
  })
  .catch((err) => {
    console.error(" Sequelize 테이블 동기화 실패:", err);
  });
module.exports = app;