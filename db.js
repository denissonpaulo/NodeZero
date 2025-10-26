const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './banco/database.sqlite'
})

module.exports = sequelize;