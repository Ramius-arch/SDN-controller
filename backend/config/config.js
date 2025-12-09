// config/config.js
require('dotenv').config();

module.exports = {
    server: {
        port: parseInt(process.env.PORT) || 3000,
        wsPort: parseInt(process.env.WS_PORT) || 8080,
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    session: {
        secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },
    openflow: {
        version: process.env.OPENFLOW_VERSION || '1.3',
        controllerPort: parseInt(process.env.OPENFLOW_PORT) || 6653,
        discoveryInterval: parseInt(process.env.DISCOVERY_INTERVAL) || 30000
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        credentials: true
    }
};
