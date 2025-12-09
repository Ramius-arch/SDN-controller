// models/FlowRule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FlowRule = sequelize.define('FlowRule', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    switch_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        validate: {
            min: 0,
            max: 65535
        }
    },
    match: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: 'Match conditions: sourceIP, destIP, sourcePort, destPort, protocol, vlanId, etc.'
    },
    actions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Actions: output, setVlan, setQueue, drop, forward, etc.'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    installedOnSwitch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'installed_on_switch'
    },
    tableId: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'table_id',
        validate: {
            min: 0,
            max: 255
        }
    },
    idleTimeout: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'idle_timeout',
        comment: 'Idle timeout in seconds, 0 means permanent'
    },
    hardTimeout: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'hard_timeout',
        comment: 'Hard timeout in seconds, 0 means permanent'
    },
    cookie: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        comment: 'Opaque controller-issued identifier'
    },
    packetCount: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        field: 'packet_count'
    },
    byteCount: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        field: 'byte_count'
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['switch_id'] },
        { fields: ['priority'] },
        { fields: ['active'] }
    ]
});

module.exports = FlowRule;
