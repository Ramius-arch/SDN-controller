// models/QosPolicy.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QosPolicy = sequelize.define('QosPolicy', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    priority_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
            min: 1,
            max: 7
        },
        comment: '1=highest, 7=lowest priority'
    },
    bandwidthMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'bandwidth_min',
        comment: 'Minimum bandwidth in Mbps'
    },
    bandwidthMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'bandwidth_max',
        comment: 'Maximum bandwidth in Mbps'
    },
    bandwidthAllocation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        field: 'bandwidth_allocation',
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Bandwidth allocation percentage'
    },
    queueId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'queue_id',
        validate: {
            min: 0,
            max: 7
        }
    },
    maxRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_rate',
        comment: 'Maximum rate in kbps'
    },
    minRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'min_rate',
        comment: 'Minimum guaranteed rate in kbps'
    },
    burstSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'burst_size',
        comment: 'Burst size in bytes'
    },
    dscp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 63
        },
        comment: 'DSCP marking value'
    },
    matchCriteria: {
        type: DataTypes.JSON,
        defaultValue: {},
        field: 'match_criteria',
        comment: 'Traffic matching criteria'
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    appliedToSwitches: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: 'applied_to_switches',
        comment: 'List of switch IDs where policy is applied'
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['name'], unique: true },
        { fields: ['enabled'] },
        { fields: ['priority_level'] }
    ]
});

module.exports = QosPolicy;
