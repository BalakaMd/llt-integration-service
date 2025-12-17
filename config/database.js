const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: {
      schema: config.schema,
      underscored: true,
      timestamps: true,
    },
  },
);

module.exports = sequelize;
