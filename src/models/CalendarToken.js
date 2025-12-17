const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CalendarToken = sequelize.define(
  'CalendarToken',
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    provider: {
      type: DataTypes.ENUM('google'),
      defaultValue: 'google',
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'calendar_tokens',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: false,
  },
);

module.exports = CalendarToken;
