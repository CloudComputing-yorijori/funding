const db = require("../models/index"),
    FundingProduct = db.fundingProduct,
    FundingGroup = db.fundingGroup,
    Composition = db.composition,
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

const getJuso = group => `${group.city} ${group.district} ${group.town} ${group.detail}`;

module.exports = {
    fundingList: async (req, res, next) => {
        try {
            const userDistrict = req.user.district;
            const query = `
                SELECT 
                    fg.fundingGroupId,
                    fp.productName,
                    fp.unitPrice,
                    fp.quantity,    
                    fp.unit,
                    fg.district,
                    fp.imageUrl
                FROM fundingGroups fg
                LEFT JOIN fundingProducts fp ON fg.fundingProductId = fp.fundingProductId
                WHERE fg.district = ? 
                AND fg.people != (
                    SELECT COUNT(*) FROM compositions WHERE fundingGroupId = fg.fundingGroupId
                );`;

            const products = await sequelize.query(query, {
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

    getFundingPage: async (req, res) => {
        res.render('funding/fundingPage', {
            products: res.locals.products[0],
            messages: req.flash('info')
        });
    },

    fundingSearch: async (req, res, next) => {
        try {
            const district = req.user.district;
            const query = req.query.query;
            const sql = `
                SELECT fg.fundingGroupId,
                       fp.productName,
                       fp.unitPrice,
                       fp.quantity,
                       fp.unit,
                       fg.district,
                       fp.imageUrl
                FROM fundingGroups fg
                LEFT JOIN fundingProducts fp ON fg.fundingProductId = fp.fundingProductId
                WHERE fg.district = ?
                AND fg.people != (SELECT COUNT(*) FROM compositions WHERE fundingGroupId = fg.fundingGroupId)
                AND fp.productName LIKE ?;`;

            if (!query) {
                res.redirect('/joinfundingPage/fundingPage');
                return;
            }

            const [results] = await sequelize.query(sql, {
                replacements: [district, `%${query}%`],
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
        res.render("funding/fundingSearch", {
            results: res.locals.results,
            query: res.locals.query
        });
    },

    joinFunding: async (req, res, next) => {
        try {
            const groupId = req.params.groupId;
            if (!groupId) return res.status(400).send({ message: "그룹 ID 누락" });
            const query = `
                SELECT  
                    fp.productName,
                    fp.quantity,
                    fp.unitPrice,
                    DATE_FORMAT(fg.deliveryDate, '%Y.%m.%d') AS deliveryDate,
                    DATE_FORMAT(fg.fundingDate, '%Y.%m.%d') AS fundingDate,
                    fg.city,
                    fg.district,
                    fg.town,
                    fg.detail,
                    DATE_FORMAT(fg.distributionDate, '%Y년 %m월 %d일 %p %I:%i') AS distributionDate,
                    fg.people,      
                    fp.unit,
                    fg.fundingGroupId,
                    fg.deliveryCost,
                    fp.imageUrl
                FROM fundingGroups fg
                LEFT JOIN fundingProducts fp ON fg.fundingProductId = fp.fundingProductId
                WHERE fg.fundingGroupId = ?;`

            const [result] = await sequelize.query(query, {
                replacements: [groupId],
                type: Sequelize.SELECT
            });
            
            if (!result || result.length === 0) {
                return res.status(404).send({ message: "해당 펀딩 그룹을 찾을 수 없습니다." });
            }
            
            const group = result[0];
            const price = group.unitPrice + (group.deliveryCost / (group.people - 1));

            res.locals.group = [group];
            res.locals.price = price;
            next();
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    getJoinFunding: async (req, res) => {
        const group = res.locals.group[0];
        const juso = getJuso(group);

        const query = `
            SELECT COUNT(*) AS c
            FROM compositions
            WHERE fundingGroupId = ?;`;

        const [results] = await sequelize.query(query, {
            replacements: [group.fundingGroupId],
            type: Sequelize.SELECT
        });

        const remaining = group.people - results[0].c - 1;

        res.render("funding/joinFunding", {
            group,
            juso,
            people: remaining
        });
    },

    getJoinFundingClick: async (req, res) => {
        try {
            const user = {
                userId: req.user.userId,
                name: req.user.name,
                phoneNumber: req.user.phoneNumber
            };

            const group = res.locals.group[0];
            const juso = getJuso(group);
            const price = res.locals.price;

            const composition = await Composition.findOne({
                where: {
                    fundingGroupId: group.fundingGroupId,
                    userId: user.userId
                }
            });

            if (composition) {
                req.flash('info', '이미 참여한 펀딩입니다.');
                res.redirect('/joinfundingPage/fundingPage');
            } else {
                res.render("funding/joinFundingClick", {
                    user,
                    group,
                    juso,
                    price
                });
            }
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    joinRequest: async (req, res, next) => {
        try {
            const group = res.locals.group[0];
            const groupId = req.params.groupId;
            const userId = req.user.userId;
            const price = res.locals.price;

            await Composition.create({
                fundingGroupId: groupId,
                userId,
                quantity: group.unit,
                amount: price
            });

            next();
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    },

    getJoinFundingComplete: async (req, res) => {
        res.render("funding/joinFundingComplete", {
            group: res.locals.group[0]
        });
    },

    cancleFunding: async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const userId = req.user.userId;
            const query = `
                DELETE FROM compositions
                WHERE userId = ? AND fundingGroupId = ?;`;

            await sequelize.query(query, {
                replacements: [userId, groupId],
                type: Sequelize.DELETE
            });

            res.redirect("/auth/mypageParticipatedFunding");
        } catch (error) {
            res.status(500).send({ message: error.message });
            console.error(`Error: ${error.message}`);
        }
    }
};
