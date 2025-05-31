// const db = require("../models/index"),
//     FundingProduct = db.fundingProduct,
//     FundingGroup = db.fundingGroup,
//     Composition = db.composition,
//     sequelize = db.sequelize,
//     Sequelize = db.Sequelize;

// // 날짜 포맷 함수 - 한국어 요일과 YYYY/MM/DD (요일) 형태로 변환
// function formatDate(dateString) {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date)) return "";

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const dayOfWeekKor = date.toLocaleDateString("ko-KR", { weekday: "short" });
//     return `${year}/${month}/${day} (${dayOfWeekKor})`;
// }

// module.exports = {
//     // 펀딩 검색 페이지 렌더링
//     showCreateFundingSearchPage: async (req, res) => {
//         try {
//             res.render("funding/createFundingSearch");
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },

//     // 상품 검색 결과 렌더링
//     searchProducts: async (req, res) => {
//         try {
//             const query = req.query.query || "";
//             const sql = `
//                 SELECT 
//                     fundingProductId, 
//                     productName, 
//                     seller, 
//                     unitPrice, 
//                     expirationDate, 
//                     quantity, 
//                     unit, 
//                     registrationDate, 
//                     imageUrl 
//                 FROM fundingProducts 
//                 WHERE productName LIKE ?`;
//             const replacements = [`%${query}%`];

//             const [results] = await sequelize.query(sql, {
//                 replacements,
//                 type: Sequelize.QueryTypes.SELECT,
//             });

//             // 만약 results가 undefined면 빈 배열로 처리
//             const formattedResults = (results || []).map(item => ({
//                 ...item,
//                 formattedExpirationDate: formatDate(item.expirationDate),
//             }));

//             res.render("funding/searchResults", { results: formattedResults, query });
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },

//     // 특정 상품 상세 조회
//     productDetail: async (req, res) => {
//         try {
//             const productId = req.params.productId;
//             const sql = `
//                 SELECT 
//                     fundingProductId, 
//                     productName, 
//                     seller, 
//                     unitPrice, 
//                     expirationDate, 
//                     quantity, 
//                     unit, 
//                     registrationDate, 
//                     imageUrl 
//                 FROM fundingProducts 
//                 WHERE fundingProductId = ?`;
//             const replacements = [productId];

//             const [product] = await sequelize.query(sql, {
//                 replacements,
//                 type: Sequelize.QueryTypes.SELECT,
//             });

//             if (!product) {
//                 return res.status(404).send({ message: "상품을 찾을 수 없습니다." });
//             }

//             product.formattedExpirationDate = formatDate(product.expirationDate);

//             res.render("funding/productDetail", { product });
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },

//     // 펀딩 생성 페이지 보여주기
//     showCreateFundingPage: async (req, res) => {
//         try {
//             const productId = req.params.productId;
//             const productSql = `
//                 SELECT 
//                     fundingProductId, 
//                     productName, 
//                     seller, 
//                     unitPrice, 
//                     expirationDate, 
//                     quantity, 
//                     unit, 
//                     registrationDate, 
//                     imageUrl 
//                 FROM fundingProducts 
//                 WHERE fundingProductId = ?`;
//             const userSql = `
//                 SELECT 
//                     userId, 
//                     email, 
//                     name, 
//                     nickname, 
//                     phoneNumber, 
//                     city, 
//                     district, 
//                     town, 
//                     detail 
//                 FROM users 
//                 WHERE userId = ?`;

//             const [products] = await sequelize.query(productSql, {
//                 replacements: [productId],
//                 type: Sequelize.QueryTypes.SELECT,
//             });
//             const product = products || null;

//             if (!product) {
//                 return res.status(404).send({ message: "상품을 찾을 수 없습니다." });
//             }
//             product.formattedExpirationDate = formatDate(product.expirationDate);

//             const [representatives] = await sequelize.query(userSql, {
//                 replacements: [req.session.user.id],
//                 type: Sequelize.QueryTypes.SELECT,
//             });
//             const representative = representatives || null;

//             res.render("funding/createFunding", { product, representative, productId });
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },

//     // 펀딩 생성 처리
//     createFunding: async (req, res) => {
//         const productId = req.params.productId;
//         try {
//             const newFundingGroup = await FundingGroup.create({
//                 fundingProductId: productId,
//                 deliveryStatus: true,
//                 deliveryCost: 4000,
//                 deliveryDate: req.body.deliveryDate,
//                 fundingDate: new Date(), // 현재 시간으로 지정, 필요시 req.body로 변경 가능
//                 city: req.body.distributionLocationCity,
//                 district: req.body.distributionLocationDistrict,
//                 town: req.body.distributionLocationTown,
//                 detail: req.body.distributionLocationDetail,
//                 distributionDate: req.body.distributionDate,
//                 people: req.body.people,
//                 representativeUserId: req.session.user.id,
//             });

//             // 해당 상품의 unit, unitPrice 조회
//             const sql = `
//                 SELECT p.unit, p.unitPrice
//                 FROM fundingProducts p
//                 WHERE p.fundingProductId = ?`;
//             const [products] = await sequelize.query(sql, {
//                 replacements: [productId],
//                 type: Sequelize.QueryTypes.SELECT,
//             });
//             const product = products || null;

//             if (!product) {
//                 return res.status(404).send({ message: "상품 정보를 찾을 수 없습니다." });
//             }

//             // Composition 생성 (펀딩 참여자 정보)
//             await Composition.create({
//                 fundingGroupId: newFundingGroup.fundingGroupId,
//                 userId: req.session.user.id,
//                 quantity: product.unit,
//                 amount: product.unitPrice,
//             });

//             res.redirect(`/createfundingPage/create_funding_success/${newFundingGroup.fundingGroupId}`);
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },

//     // 펀딩 생성 성공 페이지 렌더링
//     showCreateFundingSuccessPage: async (req, res) => {
//         try {
//             const fundingGroupId = req.params.fundingGroupId;
//             const fundingGroup = await FundingGroup.findByPk(fundingGroupId);

//             if (!fundingGroup) {
//                 return res.status(404).send({ message: "펀딩 그룹을 찾을 수 없습니다." });
//             }
//             fundingGroup.distributionDateFormatted = formatDate(fundingGroup.distributionDate);

//             res.render("funding/createFundingSuccess", { fundingGroup });
//         } catch (error) {
//             console.error(`Error: ${error.message}`);
//             res.status(500).send({ message: error.message });
//         }
//     },
// };






// 이미지서비스요청하기 수정 전 

const db = require("../models/index"),
    FundingProduct = db.fundingProduct,
    FundingGroup = db.fundingGroup,
    Composition = db.composition,
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
    const formattedDate = date.toLocaleDateString('ko-KR', options);
    
    // Format the date as YYYY/MM/DD (day)
    const [year, month, day] = formattedDate.split('. ');
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return `${year}/${month}/${day} (${dayOfWeek})`;
}

module.exports = {
    // 펀딩 검색 페이지를 렌더링
    showCreateFundingSearchPage: async (req, res) => {
        try {
            res.render("funding/createFundingSearch");
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    // 검색 결과를 렌더링
    searchProducts: async (req, res) => {
        try {
            let query = req.query.query;
            let sql = `SELECT 
                            fundingProductId, 
                            productName, 
                            seller, 
                            unitPrice, 
                            expirationDate, 
                            quantity, 
                            unit, 
                            registrationDate, 
                            imageUrl 
                        FROM 
                            fundingProducts 
                        WHERE 
                            productName LIKE ?`;
            let values = [`%${query}%`];
            
            let [results] = await sequelize.query(sql, {
                replacements: values,
                type: Sequelize.SELECT
            });
            
            // Format the expirationDate for each result
            results.forEach(result => {
                result.formattedExpirationDate = formatDate(result.expirationDate);
            });

            console.log(results);

            res.render("funding/searchResults", { results, query });
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    productDetail: async (req, res) => {
        try {
            let productId = req.params.productId;
            let sql = `SELECT 
                            fundingProductId, 
                            productName, 
                            seller, 
                            unitPrice, 
                            expirationDate, 
                            quantity, 
                            unit, 
                            registrationDate, 
                            imageUrl 
                        FROM 
                            fundingProducts 
                        WHERE 
                            fundingProductId = ${productId}`;
            let [product] = await sequelize.query(sql, { type: Sequelize.SELECT });

            if (product && product.length > 0) {
                product[0].formattedExpirationDate = formatDate(product[0].expirationDate);
            }

            res.render("funding/productDetail", { product: product[0] });
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    showCreateFundingPage: async (req, res) => {
        try {
            let productId = req.params.productId;
            let productSql = `SELECT 
                                    fundingProductId, 
                                    productName, 
                                    seller, 
                                    unitPrice, 
                                    expirationDate, 
                                    quantity, 
                                    unit, 
                                    registrationDate, 
                                    imageUrl 
                                FROM 
                                    fundingProducts 
                                WHERE 
                                    fundingProductId = ?`;
            let userSql = `SELECT 
                                userId, 
                                email, 
                                name, 
                                nickname, 
                                phoneNumber, 
                                city, 
                                district, 
                                town, 
                                detail 
                            FROM 
                                users 
                            WHERE 
                                userId = ?`;

            let [product] = await sequelize.query(productSql, {
                replacements: [productId],
                type: Sequelize.SELECT
            });
            
            let [representative] = await sequelize.query(userSql, {
                replacements: [req.session.user.id], 
                type: Sequelize.SELECT
            });

            if (product && product.length > 0) {
                product[0].formattedExpirationDate = formatDate(product[0].expirationDate);
            }

            res.render("funding/createFunding", { product: product[0], representative: representative[0], productId: productId});
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    createFunding: async (req, res) => {
        let productId = req.params.productId;
        try {
            let newFundingGroup = await FundingGroup.create({
                fundingProductId: productId,
                deliveryStatus: true,
                deliveryCost: 4000,
                deliveryDate: req.body.deliveryDate,
                fundingDate: new Date(), // 여기도 req.body.로 받아와야하는지 확인
                city: req.body.distributionLocationCity,
                district: req.body.distributionLocationDistrict,
                town: req.body.distributionLocationTown,
                detail: req.body.distributionLocationDetail,
                distributionDate: req.body.distributionDate,
                people: req.body.people,
                representativeUserId: req.session.user.id,
            });
            let sql = `     select p.unit, p.unitPrice
                            from fundingProducts p
                            left join fundingGroups g on p.fundingProductId = g.fundingProductId
                            where p.fundingProductId =  ${productId}`;

            let [product, a] = await sequelize.query(sql, {
            type: Sequelize.SELECT
            });

            let newComposition = await Composition.create({
                fundingGroupId: newFundingGroup.fundingGroupId,
                userId: req.session.user.id,
                quantity: product[0].unit,
                amount: product[0].unitPrice
            });

            console.log(newFundingGroup.fundingGroupId);
            res.redirect(`/createfundingPage/create_funding_success/${newFundingGroup.fundingGroupId}`);

        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    showCreateFundingSuccessPage: async (req, res) => {
        try {
            let fundingGroupId = req.params.fundingGroupId;
            let fundingGroup = await FundingGroup.findByPk(fundingGroupId);

            if (fundingGroup) {
                fundingGroup.distributionDateFormatted = formatDate(fundingGroup.distributionDate);
            }
            res.render("funding/createFundingSuccess", { fundingGroup });
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    }
};