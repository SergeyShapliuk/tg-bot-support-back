const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telega_sup_bot',
    'supuser',
    'xKIoyJ2dJsM6',
    {
        host: '87.242.106.252',
        port: '5432',
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 60000
        }
    }
)
