// models/TrafficRule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrafficRule = sequelize.define('TrafficRule', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sourcePort: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'source_port',
        comment: 'Source switch port'
    },
    destinationPort: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'destination_port',
        comment: 'Destination switch port'
    },
    forwardingPath: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'forwarding_path',
        comment: 'Ordered list of switches in the path'
    },
    path_type: {
        type: DataTypes.ENUM('shortest', 'lowest_latency', 'highest_bandwidth', 'manual'),
        defaultValue: 'shortest'
    },
    trafficType: {
        type: DataTypes.ENUM('unicast', 'multicast', 'broadcast'),
        defaultValue: 'unicast',
        field: 'traffic_type'
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'TCP, UDP, ICMP, etc.'
    },
    vlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'vlan_id',
        validate: {
            min: 1,
            max: 4094
        }
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        validate: {
            min: 0,
            max: 65535
        }
    },
    loadBalancing: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'load_balancing'
    },
    failoverEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'failover_enabled'
    },
    backupPath: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'backup_path',
        comment: 'Backup path for failover'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    installedOnSwitches: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'installed_on_switches'
    },
    statistics: {
        type: DataTypes.JSON,
        defaultValue: {
            packetsForwarded: 0,
            bytesForwarded: 0,
            droppedPackets: 0,
            errorCount: 0
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['active'] },
        { fields: ['priority'] },
        { fields: ['path_type'] }
    ]
});

module.exports = TrafficRule;
