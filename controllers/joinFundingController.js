// const db = require("../models/index"),
//     FundingProduct = db.fundingProduct,
//     FundingGroup = db.fundingGroup,
//     Composition = db.composition,
//     sequelize = db.sequelize,
//     Sequelize = db.Sequelize;

// const http = require("http"); // Node 기본 http 모듈 사용

// // 이미지 서비스에 직접 HTTP 요청 보내서 이미지 데이터 받아오기
// function getImageData(imageId) {
//     return new Promise((resolve, reject) => {
//         const options = {
//             hostname: "image-service", // 이미지 서비스 호스트명(도메인 or IP)
//             port: 3000,                // 이미지 서비스 포트
//             path: `/images/${imageId}`, // 이미지 요청 경로
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json"
//             }
//         };

//         const req = http.request(options, (res) => {
//             let data = "";
//             res.on("data", (chunk) => {
//                 data += chunk;
//             });
//             res.on("end", () => {
//                 try {
//                     const parsed = JSON.parse(data);
//                     resolve(parsed.data); // { data: "base64EncodedImage" } 형태라고 가정
//                 } catch (err) {
//                     reject(err);
//                 }
//             });
//         });

//         req.on("error", (err) => {
//             reject(err);
//         });
//         req.end();
//     });
// };

// getJuso = group => { // 주소 합치기
//     let juso = `${group.city} ${group.district} ${group.town} ${group.detail}`;
//     return juso;
// };

// module.exports = {
//     fundingList: async (req, res, next) => {
//         try {
//             let userDistrict = req.session.user?.district;
//             if (!userDistrict) return res.status(401).send({ message: "세션 없음" });

//             // imageUrl 대신 imageId로 수정
//             let query = `
//                 SELECT 
//                     fundingGroups.fundingGroupId,
//                     fundingProducts.productName,
//                     fundingProducts.unitPrice,
//                     fundingProducts.quantity,    
//                     fundingProducts.unit,
//                     fundingGroups.district,
//                     fundingProducts.imageId
//                 FROM fundingGroups
//                 LEFT JOIN fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
//                 WHERE fundingGroups.district = ? AND fundingGroups.people != (
//                     SELECT COUNT(*)
//                     FROM compositions
//                     WHERE compositions.fundingGroupId = fundingGroups.fundingGroupId
//                 );`;

//             let [products] = await sequelize.query(query, {
//                 replacements: [userDistrict],
//                 type: Sequelize.QueryTypes.SELECT
//             });

//             // 이미지 서비스에 직접 요청 보내서 imageUrl 필드에 base64 이미지 데이터 넣기
//             await Promise.all(products.map(async (product) => {
//                 try {
//                     const imageData = await getImageData(product.imageId);
//                     product.imageUrl = imageData; // base64 인코딩된 이미지 문자열 또는 URL 대체
//                 } catch (err) {
//                     console.error("이미지 로딩 실패:", err.message);
//                     product.imageUrl = null;
//                 }
//             }));

//             res.locals.products = products;
//             next();
//         } catch (error) {
//             res.status(500).send({ message: error.message });
//             console.error(`Error: ${error.message}`);
//         }
//     },

//     getFundingPage: async (req, res) => { //펀딩그룹모집중인 목록 보여주는 처음페이지
//         let products = res.locals.products;
//         res.render('funding/fundingPage', { products: products, messages: req.flash('info') });
//     },

//     fundingSearch: async (req, res, next) => {
//         try {
//             let userDistrict = req.session.user?.district;
//             if (!userDistrict) return res.status(401).send({ message: "세션 없음" });

//             let query = req.query.query;
//             if (!query) {
//                 res.redirect('/joinfundingPage/fundingPage');
//                 return;
//             }

//             let sql = `
//                 SELECT fundingGroups.fundingGroupId,
//                        fundingProducts.productName,
//                        fundingProducts.unitPrice,
//                        fundingProducts.quantity,
//                        fundingProducts.unit,
//                        fundingGroups.district,
//                        fundingProducts.imageId
//                 FROM fundingGroups
//                 LEFT JOIN fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
//                 WHERE fundingGroups.district = ? AND fundingGroups.people != (
//                     SELECT COUNT(*)
//                     FROM compositions
//                     WHERE compositions.fundingGroupId = fundingGroups.fundingGroupId
//                 ) AND productName LIKE ?`;

//             let values = [userDistrict, `%${query}%`];

//             let [results] = await sequelize.query(sql, {
//                 replacements: values,
//                 type: Sequelize.QueryTypes.SELECT
//             });

//             // 이미지 서비스에서 직접 이미지 받아오기
//             await Promise.all(results.map(async (product) => {
//                 try {
//                     const imageData = await getImageData(product.imageId);
//                     product.imageUrl = imageData;
//                 } catch (err) {
//                     console.error("이미지 로딩 실패:", err.message);
//                     product.imageUrl = null;
//                 }
//             }));

//             res.locals.results = results;
//             res.locals.query = query;
//             next();
//         } catch (error) {
//             res.status(500).send({ message: error.message });
//             console.error(`Error: ${error.message}`);
//         }
//     },

//     getFundingSearch: async (req, res) => {
//         res.render("funding/fundingSearch", { results: res.locals.results, query: res.locals.query });
//     },

//     joinFunding: async (req, res, next) => {
//         try {
//             let groupId = req.params.groupId;
//             let query = `
//                 SELECT  
//                     fundingProducts.productName,
//                     fundingProducts.quantity,
//                     fundingProducts.unitPrice,
//                     DATE_FORMAT(fundingGroups.deliveryDate, '%Y.%m.%d') AS deliveryDate,
//                     DATE_FORMAT(fundingGroups.fundingDate, '%Y.%m.%d') AS fundingDate,
//                     fundingGroups.city,
//                     fundingGroups.district,
//                     fundingGroups.town,
//                     fundingGroups.detail,
//                     DATE_FORMAT(fundingGroups.distributionDate, '%Y년 %m월 %d일 %p %I:%i') AS distributionDate,
//                     fundingGroups.people,      
//                     fundingProducts.unit,
//                     fundingGroups.fundingGroupId,
//                     fundingGroups.deliveryCost,
//                     fundingProducts.imageId
//                 FROM fundingGroups
//                 LEFT JOIN fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
//                 WHERE fundingGroups.fundingGroupId = ${groupId};`;

//             let [result] = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });

//             // 이미지 데이터 직접 요청
//             try {
//                 const imageData = await getImageData(result.imageId);
//                 result.imageUrl = imageData;
//             } catch (err) {
//                 console.error("이미지 로딩 실패:", err.message);
//                 result.imageUrl = null;
//             }

//             res.locals.group = [result];

//             let price = result.unitPrice + (result.deliveryCost / (result.people - 1));
//             res.locals.price = price;
//             next();
//         } catch (error) {
//             res.status(500).send({ message: error.message });
//             console.error(`Error: ${error.message}`);
//         }
//     },

//     getJoinFunding: async (req, res) => {
//         let groups = res.locals.group[0];
//         let juso = getJuso(groups);

//         let query = `
//             SELECT count(fundingGroupId) as c
//             FROM compositions
//             WHERE fundingGroupId = ${groups.fundingGroupId};`;

//         let [results] = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
//         let people = groups.people - results[0].c - 1;

//         res.render("funding/joinFunding", { group: groups, juso: juso, people: people });
//     },

//     getJoinFundingClick: async (req, res) => {
//         try {
//             let user = req.session.user;
//             if (!user) return res.status(401).send({ message: "세션 없음" });

//             let groups = res.locals.group[0];
//             let juso = getJuso(groups);
//             let price = res.locals.price;

//             let composition = await Composition.findOne({
//                 where: {
//                     fundingGroupId: groups.fundingGroupId,
//                     userId: user.id
//                 }
//             });

//             if (composition) {
//                 req.flash('info', '이미 참여한 펀딩입니다.');
//                 res.redirect('/joinfundingPage/fundingPage');
//             } else {
//                 res.render("funding/joinFundingClick", {
//                     user: user,
//                     group: groups,
//                     juso: juso,
//                     price: price
//                 });
//             }
//         } catch (error) {
//             res.status(500).send({ message: error.message });
//             console.error(`Error: ${error.message}`);
//         }
//     },

//     joinRequest: async (req, res, next) => {
//         let groups = res.locals.group[0];
//         let groupId = req.params.groupId;
//         let user = req.session.user;

//         if (!user) return res.status(401).send({ message: "세션 없음" });

//         await Composition.create({
//             fundingGroupId: groupId,
//             userId: user.id,
//             quantity: groups.unit,
//             amount: res.locals.price
//         });

//         next();
//     },

//     getJoinFundingComplete: async (req, res) => {
//         res.render("funding/joinFundingComplete", { group: res.locals.group[0] });
//     },

//     cancleFunding: async (req, res) => {
//         let groupId = req.params.groupId;
//         let user = req.session.user;

//         if (!user) return res.status(401).send({ message: "세션 없음" });

//         await sequelize.query(`
//             DELETE FROM compositions
//             WHERE userId = ${user.id} and fundingGroupId = ${groupId};
//         `, { type: Sequelize.QueryTypes.DELETE });

//         res.redirect("/auth/mypageParticipatedFunding");
//     }
// };







// 이미지서비스요청하기 수정 전 

const db = require("../models/index"),
    FundingProduct = db.fundingProduct,
    FundingGroup = db.fundingGroup,
    Composition = db.composition,
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

getJuso = group => { //주소합치기
    let juso = `${group.city} ${group.district} ${group.town} ${group.detail}`;
    return juso;
};

module.exports = {
    fundingList: async (req, res, next) => {
        try {
            // 세션에서 로그인된 사용자 정보 추출
            let userDistrict = req.session.user?.district;
            if (!userDistrict) return res.status(401).send({ message: "세션 없음" });

            //펀딩그룹을 기준으로 펀딩상품 테이블을 조인해서 정보가져옴. users 테이블 제거
            let query = `
                SELECT 
                    fundingGroups.fundingGroupId,
                    fundingProducts.productName,
                    fundingProducts.unitPrice,
                    fundingProducts.quantity,    
                    fundingProducts.unit,
                    fundingGroups.district,
                    fundingProducts.imageUrl
                FROM
                    fundingGroups
                LEFT JOIN
                    fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
                WHERE fundingGroups.district = ? AND fundingGroups.people != (
                    SELECT COUNT(*)
                    FROM compositions
                    WHERE compositions.fundingGroupId = fundingGroups.fundingGroupId
                );`;

            let products = await sequelize.query(query, {
                replacements: [userDistrict],
                type: Sequelize.SELECT
            });

            res.locals.products = products;
            next();
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    getFundingPage: async (req, res) => { //펀딩그룹모집중인 목록 보여주는 처음페이지
        let products = res.locals.products;
        res.render('funding/fundingPage', { products: products[0], messages: req.flash('info') }); //products안에 동일한 객체 2개가 배열로 이루어져있어서 첫번째 객체만 출력하게함.
    },

    fundingSearch: async (req, res, next) => {
        try {
            let userDistrict = req.session.user?.district;
            if (!userDistrict) return res.status(401).send({ message: "세션 없음" });

            let query = req.query.query;
            let sql = `
                SELECT fundingGroups.fundingGroupId,
                       fundingProducts.productName,
                       fundingProducts.unitPrice,
                       fundingProducts.quantity,
                       fundingProducts.unit,
                       fundingGroups.district,
                       fundingProducts.imageUrl
                FROM fundingGroups
                LEFT JOIN fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
                WHERE fundingGroups.district = ? AND fundingGroups.people != (
                    SELECT COUNT(*)
                    FROM compositions
                    WHERE compositions.fundingGroupId = fundingGroups.fundingGroupId
                ) AND productName LIKE ?`;

            if (!query) {
                res.redirect('/joinfundingPage/fundingPage');
                return;
            }

            let values = [userDistrict, `%${query}%`];

            let [results, metadata] = await sequelize.query(sql, {
                replacements: values,
                type: Sequelize.SELECT
            });

            res.locals.results = results;
            res.locals.query = query;
            next();
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    getFundingSearch: async (req, res) => {
        res.render("funding/fundingSearch", { results: res.locals.results, query: res.locals.query });
    },

    joinFunding: async (req, res, next) => {
        try {
            let groupId = req.params.groupId;
            let query = `
                SELECT  
                    fundingProducts.productName,
                    fundingProducts.quantity,
                    fundingProducts.unitPrice,
                    DATE_FORMAT(fundingGroups.deliveryDate, '%Y.%m.%d') AS deliveryDate,
                    DATE_FORMAT(fundingGroups.fundingDate, '%Y.%m.%d') AS fundingDate,
                    fundingGroups.city,
                    fundingGroups.district,
                    fundingGroups.town,
                    fundingGroups.detail,
                    DATE_FORMAT(fundingGroups.distributionDate, '%Y년 %m월 %d일 %p %I:%i') AS distributionDate,
                    fundingGroups.people,      
                    fundingProducts.unit,
                    fundingGroups.fundingGroupId,
                    fundingGroups.deliveryCost,
                    fundingProducts.imageUrl
                FROM fundingGroups
                LEFT JOIN fundingProducts ON fundingGroups.fundingProductId = fundingProducts.fundingProductId
                WHERE fundingGroups.fundingGroupId = ${groupId};`;

            let result = await sequelize.query(query, { type: Sequelize.SELECT });
            res.locals.group = result[0];

            let price = res.locals.group[0].unitPrice + (res.locals.group[0].deliveryCost / (res.locals.group[0].people - 1));
            res.locals.price = price;
            next();
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    getJoinFunding: async (req, res) => { //참여할 펀딩선택했을때 선택한 펀딩에 대한 정보 보여주기
        let groups = res.locals.group[0];
        let juso = getJuso(groups);

        let query = `
            SELECT count(fundingGroupId) as c
            FROM compositions
            WHERE fundingGroupId = ${groups.fundingGroupId};`;

        let [results, metadata] = await sequelize.query(query, { type: Sequelize.SELECT });
        let people = groups.people - results[0].c - 1;
        res.render("funding/joinFunding", { group: groups, juso: juso, people: people });
    },

    getJoinFundingClick: async (req, res) => { //펀딩 참여눌렀을 때 확인페이지
        try {
            let user = req.session.user;
            if (!user) return res.status(401).send({ message: "세션 없음" });

            let groups = res.locals.group[0];
            let juso = getJuso(groups);
            let price = res.locals.price;

            let composition = await Composition.findOne({
                where: {
                    fundingGroupId: groups.fundingGroupId,
                    userId: user.id
                }
            });

            if (composition) {
                console.log("참여한펀딩");
                req.flash('info', '이미 참여한 펀딩입니다.')
                res.redirect('/joinfundingPage/fundingPage');
            } else {
                res.render("funding/joinFundingClick", {
                    user: user,
                    group: groups,
                    juso: juso,
                    price: price
                });
            }
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    joinRequest: async (req, res, next) => {
        let groups = res.locals.group[0];
        let groupId = req.params.groupId;
        let user = req.session.user;

        if (!user) return res.status(401).send({ message: "세션 없음" });

        let newComposition = await Composition.create({
            fundingGroupId: groupId,
            userId: user.id,
            quantity: groups.unit,
            amount: res.locals.price
        });

        next();
    },

    getJoinFundingComplete: async (req, res) => { //참여완료하고 알림?정보 보여주는 페이지
        res.render("funding/joinFundingComplete", { group: res.locals.group[0] });
    },

    cancleFunding: async (req, res) => { //마이페이지에서 참여한 펀딩 취소
        let groupId = req.params.groupId;
        let user = req.session.user;

        if (!user) return res.status(401).send({ message: "세션 없음" });

        let query = `
            DELETE FROM compositions
            WHERE userId = ${user.id} and fundingGroupId = ${groupId};`;

        let result = await sequelize.query(query, { type: Sequelize.DELETE });
        res.redirect("/auth/mypageParticipatedFunding");
    }
};
