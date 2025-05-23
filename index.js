const express = require("express"),
    layouts = require("express-ejs-layouts"),
    bodyParser = require('body-parser');

const fs = require("fs");
const path = require("path");

const app = express();


//bodyParser 추가
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.use(layouts);
app.use(express.static('public')); // 정적 파일 사용


// 세션 설정
app.use(session({
    secret: 'yorijori_secret_key',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.flashMessages = req.flash();
    console.log(res.locals.flashMessages);
    next();
});


// 모든 요청 전에 실행되는 미들웨어
// app.use((req, res, next) => {
//     res.locals.showCategoryBar = false; // 기본적으로 카테고리 바를 표시하지 않음
//     res.locals.showSubCategoryBar = false; // 기본적으로 세부 카테고리 바를 표시하지 않음
//     next();
// });

// Router
const joinFundingRouter = require("./routers/joinFundingRouter.js")
const createFundingRouter = require("./routers/createFundingRouter.js")


// home 접근
app.use("/", homeRouter);
// createFundingRouter 접근
app.use("/createfundingPage", createFundingRouter);
// joinFundingRouter 접근
app.use("/joinfundingPage", joinFundingRouter);

// 서버 실행
app.set("port", 3000);
app.listen(app.get("port"), "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
});

module.exports = app;