const sequelize = require('./db');
const {DataTypes} = require('sequelize');


const User = sequelize.define('user', {
    // id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true, allowNull: false},
    chatId: {type: DataTypes.INTEGER, primaryKey: true, unique: true},
    points: {type: DataTypes.INTEGER, defaultValue: 0},
})

module.exports = User;
