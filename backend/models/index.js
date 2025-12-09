// models/index.js
const sequelize = require('../config/database');
const User = require('./User');
const Switch = require('./Switch');
const Port = require('./Port');
const FlowRule = require('./FlowRule');
const QosPolicy = require('./QosPolicy');
const TrafficRule = require('./TrafficRule');

// Define relationships
Switch.hasMany(Port, {
    foreignKey: 'switchId',
    as: 'ports',
    onDelete: 'CASCADE'
});

Port.belongsTo(Switch, {
    foreignKey: 'switchId',
    as: 'switch'
});

Switch.hasMany(FlowRule, {
    foreignKey: 'switchId',
    as: 'flowRules',
    onDelete: 'CASCADE'
});

FlowRule.belongsTo(Switch, {
    foreignKey: 'switchId',
    as: 'switch'
});

// Initialize database
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync models in development
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database models synchronized.');
        }
        
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Switch,
    Port,
    FlowRule,
    QosPolicy,
    TrafficRule,
    initDatabase
};
