const db = require("../models/index"),
    FundingProduct = db.fundingProduct,
    FundingGroup = db.fundingGroup,
    Composition = db.composition,
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

// GET /fundings/participated?userId=42
exports.getParticipatedFundings = async (req, res) => {
    const userId = req.user.userId;
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
            order: [[Sequelize.literal('`fundingGroup.fundingDate`'), 'DESC']]
        });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
};

// GET /fundings/opened?userId=42
exports.getOpenedFundings = async (req, res) => {
    const userId = req.user.userId;
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