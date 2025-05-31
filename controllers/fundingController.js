// const http = require("http");
// const db = require("../models/index"),
//     FundingProduct = db.fundingProduct,
//     FundingGroup = db.fundingGroup,
//     Composition = db.composition,
//     sequelize = db.sequelize,
//     Sequelize = db.Sequelize;

// // 이미지 서비스에서 이미지 정보 가져오기
// function getImageData(imageId, callback) {
//     const options = {
//         method: "GET",
//         hostname: "image-service", // 서비스 이름 또는 실제 IP
//         port: 3000,
//         path: `/images/${imageId}`,
//         headers: {
//             "Content-Type": "application/json"
//         }
//     };

//     const req = http.request(options, (res) => {
//         let data = "";
//         res.on("data", (chunk) => data += chunk);
//         res.on("end", () => {
//             try {
//                 const parsed = JSON.parse(data);
//                 callback(null, parsed.data); // 이미지 응답 구조에 맞게 조정
//             } catch (err) {
//                 callback(err);
//             }
//         });
//     });

//     req.on("error", (err) => callback(err));
//     req.end();
// }

// // 내가 참여한 펀딩
// exports.getParticipatedFundings = async (req, res) => {
//     const userId = req.user.userId;
//     if (!userId) return res.status(400).json({ message: 'userId is required' });

//     try {
//         const results = await Composition.findAll({
//             where: { userId },
//             attributes: ['userId', 'fundingGroupId'],
//             include: [
//                 {
//                     model: FundingGroup,
//                     attributes: ['fundingDate', 'people'],
//                     include: [
//                         {
//                             model: FundingProduct,
//                             attributes: ['productName', 'imageId']
//                         }
//                     ]
//                 }
//             ],
//             order: [[Sequelize.literal('`fundingGroup.fundingDate`'), 'DESC']]
//         });

//         // 이미지 서비스에서 이미지 정보 가져오기
//         const promises = results.map(async (item) => {
//             const product = item.fundingGroup.fundingProduct;
//             return new Promise((resolve) => {
//                 getImageData(product.imageId, (err, image) => {
//                     if (err) {
//                         product.dataValues.image = null;
//                     } else {
//                         product.dataValues.image = image;
//                     }
//                     delete product.dataValues.imageId;
//                     resolve(item);
//                 });
//             });
//         });

//         const enrichedResults = await Promise.all(promises);
//         res.json(enrichedResults);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'DB error' });
//     }
// };

// // 내가 연 펀딩
// exports.getOpenedFundings = async (req, res) => {
//     const userId = req.user.userId;
//     if (!userId) return res.status(400).json({ message: 'userId is required' });

//     try {
//         const results = await FundingGroup.findAll({
//             where: { representativeUserId: userId },
//             attributes: ['representativeUserId', 'fundingDate', 'people'],
//             include: [
//                 {
//                     model: FundingProduct,
//                     attributes: ['productName', 'imageId']
//                 }
//             ],
//             order: [['fundingDate', 'DESC']]
//         });

//         const promises = results.map(async (item) => {
//             const product = item.fundingProduct;
//             return new Promise((resolve) => {
//                 getImageData(product.imageId, (err, image) => {
//                     if (err) {
//                         product.dataValues.image = null;
//                     } else {
//                         product.dataValues.image = image;
//                     }
//                     delete product.dataValues.imageId;
//                     resolve(item);
//                 });
//             });
//         });

//         const enrichedResults = await Promise.all(promises);
//         res.json(enrichedResults);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'DB error' });
//     }
// };



// 이미지서비스요청 수정 전
const db = require("../models/index"),
    FundingProduct = db.fundingProduct,
    FundingGroup = db.fundingGroup,
    Composition = db.composition,
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

// GET /fundings/participated
exports.getParticipatedFundings = async (req, res) => {
    const userId = req.session?.user?.userId;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const results = await Composition.findAll({
            where: { userId },
            attributes: ['userId', 'fundingGroupId'],
            include: [
                {
                    model: FundingGroup,
                    attributes: ['fundingDate', 'people'],
                    include: [
                        {
                            model: FundingProduct,
                            attributes: ['productName', 'imageUrl']
                        }
                    ]
                }
            ],
            order: [[Sequelize.literal('fundingGroup.fundingDate'), 'DESC']]
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
};

// GET /fundings/opened
exports.getOpenedFundings = async (req, res) => {
  console.log("요청 들어온 세션:", req.session);

    const userId = req.session?.user?.userId;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const results = await FundingGroup.findAll({
            where: { representativeUserId: userId },
            attributes: ['representativeUserId', 'fundingDate', 'people'],
            include: [
                {
                    model: FundingProduct,
                    attributes: ['productName', 'imageUrl']
                }
            ],
            order: [['fundingDate', 'DESC']]
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'DB error' });
    }
};
