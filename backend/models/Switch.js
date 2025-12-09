// models/Switch.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Switch = sequelize.define('Switch', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    datapath_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'OpenFlow Datapath ID'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ip_address',
        validate: {
            isIP: true
        }
    },
    port: {
        type: DataTypes.INTEGER,
        defaultValue: 6653,
        validate: {
            min: 1,
            max: 65535
        }
    },
    manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hardware: {
        type: DataTypes.STRING,
        allowNull: true
    },
    software: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'serial_number'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    numTables: {
        type: DataTypes.INTEGER,
        defaultValue: 255,
        field: 'num_tables'
    },
    numPorts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'num_ports'
    },
    capabilities: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Switch capabilities'
    },
    connected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastSeen: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_seen'
    },
    connectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'connected_at'
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['datapath_id'], unique: true },
        { fields: ['connected'] }
    ]
});

module.exports = Switch;
