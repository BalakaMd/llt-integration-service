const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const WeatherCache = sequelize.define(
  'WeatherCache',
  {
    query_hash: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    fetched_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'weather_cache',
    timestamps: false,
  },
);

module.exports = WeatherCache;
