const sequelize = require('../db')
const {DataTypes} = require('sequelize')

// sequelize.sync({ force: true });

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chatId: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    groupCreator: {type: DataTypes.BOOLEAN, defaultValue: false},
    mainUserId: {type: DataTypes.INTEGER}
})

const ProductTree = sequelize.define('productTree', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull:false },
    parentId: { type: DataTypes.INTEGER, defaultValue: null }
})

const ProductsInHome = sequelize.define('productsInHome', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    expirationDate: {type: DataTypes.DATEONLY, allowNull: false},
    toBuy: {type: DataTypes.BOOLEAN, defaultValue: false}, 
    quantity: {type: DataTypes.INTEGER, defaultValue: 1},
    minQuantity: {type: DataTypes.INTEGER, defaultValue: 1},
    type: {type: DataTypes.STRING}
})

const Unit = sequelize.define('unit', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true},
    name: {type: DataTypes.STRING, allowNull: false},
})

const Template = sequelize.define('template', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true},
    name: {type: DataTypes.STRING, allowNull: false},
    quantity: {type: DataTypes.INTEGER, defaultValue: 1}
})

// ProductsInHome.belongsTo(ProductTree, {as: 'productTree', foreignKey: 'productTreeId', targetKey: 'id'})
// ProductsInHome.belongsTo(Unit, {as: 'unit', foreignKey: 'unitId', targetKey: 'id'})
ProductsInHome.belongsTo(User, {as: 'user', foreignKey: 'userId', targetKey: 'id'})
Template.belongsTo(Unit, {as: 'unit', foreignKey: 'unitId', targetKey: 'id'})
Template.belongsTo(ProductTree, {as: 'productTree', foreignKey: 'productTreeId', targetKey: 'id'})

module.exports = {
    User,
    ProductTree,
    ProductsInHome,
    Template,
    Unit
}
