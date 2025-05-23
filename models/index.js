const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db= {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.fundingProduct = require('./fundingProduct.js')(sequelize, Sequelize); //펀딩상품
db.fundingGroup = require('./fundingGroup.js')(sequelize, Sequelize); //펀딩그룹


// Funding Groups and Funding Products
db.fundingGroup.belongsTo(db.fundingProduct, { foreignKey: 'fundingProductId' });
db.fundingProduct.hasMany(db.fundingGroup, { foreignKey: 'fundingProductId' });

// Funding Groups and Users (Leaders)
db.fundingGroup.belongsToMany(db.user, { 
    through: 'composition',foreignKey: 'fundingGroupId',
    otherKey: 'userId'});
db.user.belongsToMany(db.fundingGroup, {
     through: 'composition',foreignKey: 'userId',
otherKey: 'fundingGroupId'});

module.exports= db;