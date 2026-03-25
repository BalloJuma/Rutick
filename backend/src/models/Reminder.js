const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reminder = sequelize.define('Reminder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    reminderType: {
        type: DataTypes.ENUM('24h-before', '1h-before', 'day-of'),
        defaultValue: '24h-before',
    },
    scheduledFor: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    sentAt: DataTypes.DATE,
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed'),
        defaultValue: 'pending',
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    method: {
        type: DataTypes.ENUM('email', 'sms'),
        defaultValue: 'email',
    },
}, {
    timestamps: true,
    tableName: 'reminders',
    underscored: true
});

module.exports = Reminder;
