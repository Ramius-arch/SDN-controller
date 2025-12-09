// models/Port.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Port = sequelize.define('Port', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    switch_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Switches',
            key: 'id'
        }
    },
    port_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hwAddr: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'hw_addr',
        comment: 'MAC address'
    },
    config: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Port configuration'
    },
    state: {
        type: DataTypes.ENUM('up', 'down', 'blocked'),
        defaultValue: 'down'
    },
    currentSpeed: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'current_speed',
        comment: 'Current speed in kbps'
    },
    maxSpeed: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'max_speed',
        comment: 'Maximum speed in kbps'
    },
    features: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Port features'
    },
    statistics: {
        type: DataTypes.JSON,
        defaultValue: {
            rxPackets: 0,
            txPackets: 0,
            rxBytes: 0,
            txBytes: 0,
            rxDropped: 0,
            txDropped: 0,
            rxErrors: 0,
            txErrors: 0
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['switch_id'] },
        { fields: ['port_number'] },
        { fields: ['state'] }
    ]
});

module.exports = Port;
