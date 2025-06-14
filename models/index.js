const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db= {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.fundingProduct = require('./fundingProduct.js')(sequelize, Sequelize); //펀딩상품
db.fundingGroup = require('./fundingGroup.js')(sequelize, Sequelize); //펀딩그룹
db.composition = require('./composition.js')(sequelize, Sequelize); //구성

// Funding Groups and Funding Products
db.fundingGroup.belongsTo(db.fundingProduct, { foreignKey: 'fundingProductId' });
db.fundingProduct.hasMany(db.fundingGroup, { foreignKey: 'fundingProductId' });

// Funding Groups and Compositions
db.fundingGroup.hasMany(db.composition, { foreignKey: 'fundingGroupId' });
db.composition.belongsTo(db.fundingGroup, { foreignKey: 'fundingGroupId' });

// 초기 데이터 삽입
(async () => {
    await sequelize.sync();
  
    const count = await db.fundingProduct.count();
    if (count === 0) {
      await db.fundingProduct.bulkCreate([
        {
          productName: '감자',
          seller: '친환경농장',
          unitPrice: 12000,
          expirationDate: '2025-12-31',
          quantity: 100,
          unit: 5,
          registrationDate: '2025-05-01',
          imageUrl: '/assets/potato.png'
        },
        {
          productName: '고구마',
          seller: '고구마농원',
          unitPrice: 15000,
          expirationDate: '2025-11-30',
          quantity: 80,
          unit: 5,
          registrationDate: '2025-05-10',
          imageUrl: '/assets/sweetPotato.png'
        },
        {
          productName: '양파',
          seller: '양파농장',
          unitPrice: 28000,
          expirationDate: '2026-01-15',
          quantity: 50,
          unit: 5,
          registrationDate: '2025-05-15',
          imageUrl: '/assets/onion.png'
        },
        {
          productName: '마늘',
          seller: '마늘하우스',
          unitPrice: 9000,
          expirationDate: '2025-10-01',
          quantity: 200,
          unit: 5,
          registrationDate: '2025-05-20',
          imageUrl: '/assets/garlic.png'
        },
        {
          productName: '당근',
          seller: '당근마을',
          unitPrice: 22000,
          expirationDate: '2026-06-01',
          quantity: 60,
          unit: 5,
          registrationDate: '2025-05-22',
          imageUrl: '/assets/carrot.png'
        },
        {
          productName: '계란',
          seller: '계란마을',
          unitPrice: 7000,
          expirationDate: '2025-09-30',
          quantity: 150,
          unit: 5,
          registrationDate: '2025-05-25',
          imageUrl: '/assets/egg.png'
        }
      ]);
      console.log('초기 fundingProducts 데이터 삽입 완료');
    }

    const groupCount = await db.fundingGroup.count();
    if (groupCount === 0) {
      const fundingGroups = [
        { fundingProductId: 1, fundingDate: new Date('2025-06-15'), city: '서울시', district: '성북구', town: '길음동', detail: '성북로 1길 10', deliveryDate: null, deliveryStatus: false, deliveryCost: 3000, distributionDate: new Date(0), people: 5, representativeUserId: 1 },
        { fundingProductId: 2, fundingDate: new Date('2025-06-18'), city: '서울시', district: '성북구', town: '정릉동', detail: '정릉로 45길 20', deliveryDate: null, deliveryStatus: false, deliveryCost: 3500, distributionDate: new Date(0), people: 8, representativeUserId: 2 },
        { fundingProductId: 3, fundingDate: new Date('2025-06-21'), city: '서울시', district: '성북구', town: '돈암동', detail: '동소문로 30길 5', deliveryDate: null, deliveryStatus: false, deliveryCost: 4000, distributionDate: new Date(0), people: 4, representativeUserId: 1 },
        { fundingProductId: 4, fundingDate: new Date('2025-06-24'), city: '서울시', district: '성북구', town: '삼선동', detail: '삼선교로 3길 17', deliveryDate: null, deliveryStatus: false, deliveryCost: 2500, distributionDate: new Date(0), people: 7, representativeUserId: 2 },
        { fundingProductId: 5, fundingDate: new Date('2025-06-27'), city: '서울시', district: '성북구', town: '석관동', detail: '석관로 99', deliveryDate: null, deliveryStatus: false, deliveryCost: 3000, distributionDate: new Date(0), people: 3, representativeUserId: 1 },
        { fundingProductId: 6, fundingDate: new Date('2025-06-30'), city: '서울시', district: '성북구', town: '장위동', detail: '장위로 88길 3', deliveryDate: null, deliveryStatus: false, deliveryCost: 2800, distributionDate: new Date(0), people: 6, representativeUserId: 2 }
      ];
      await db.fundingGroup.bulkCreate(fundingGroups);
      console.log('✅ fundingGroup 6개 초기 데이터 삽입 완료');
    }
  })();

module.exports= db;