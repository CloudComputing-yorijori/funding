const express = require("express");
const app = express();
const layouts = require("express-ejs-layouts");
const db = require("./models/index");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const multerGoogleStorage = require("multer-google-storage");
const cors = require("cors");
require("dotenv").config();

// Redis 관련 모듈
const Redis = require("redis");
const { RedisStore } = require("connect-redis");

// Redis 클라이언트 생성
const redisClient = Redis.createClient({
  legacyMode: true,
  url: "redis://redis:6379",
});
redisClient.connect().catch(console.error);

// DB 연결
db.sequelize.sync({});

// core 오류 방지 설정
app.use(cors({
  origin: ['https://yorijori.com'],
  credentials: true
}));
    

// BodyParser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 정적 파일 제공
app.use("/uploadprofile", express.static(path.join(__dirname, "uploadprofile")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));

// 뷰 엔진 설정
app.set("view engine", "ejs");
app.use(layouts);

// 모든 요청 전에 실행되는 미들웨어
app.use((req, res, next) => {
    res.locals.showCategoryBar = false; // 기본적으로 카테고리 바를 표시하지 않음
    res.locals.showSubCategoryBar = false; // 기본적으로 세부 카테고리 바를 표시하지 않음
    next();
});

// 세션 설정 (Redis 사용)
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "yorijori_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// 플래시 메시지 설정
app.use(flash());


  app.use((req, res, next) => {
    // 세션 로그인 여부
    res.locals.loggedIn = !!req.session.user;
    // 세션에서 현재 유저 정보 설정
    res.locals.currentUser = req.session.user || null;
    // flash 메시지 처리
    res.locals.flashMessages = req.flash();
    next();
  });

// 전역 변수 설정 (템플릿 접근용)
// app.use((req, res, next) => {
//   res.locals.successMessages = req.flash("success");
//   res.locals.errorMessages = req.flash("error");
//   res.locals.loggedIn = req.isAuthenticated();
//   res.locals.currentUser = req.user;
//   res.locals.flashMessages = req.flash();
//   res.locals.showCategoryBar = false;
//   res.locals.showSubCategoryBar = false;
//   console.log(res.locals.flashMessages);
//   next();
// });

// Passport 설정
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// 라우터 연결
const joinFundingRouter = require("./routers/joinFundingRouter.js");
const createFundingRouter = require("./routers/createFundingRouter.js");
const fundingRouter = require("./routers/fundingRoutes.js");
// const testRoutes = require("./routers/testRoutes");

app.use("/createfundingPage", createFundingRouter);
app.use("/joinfundingPage", joinFundingRouter);
app.use("/funding", fundingRouter);
// app.use("/test", testRoutes);

// 서버 실행
app.set("port", 3001);
app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

module.exports = app;
