// index.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Database configuration
const sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT,
    database: process.env.DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
});

// Models initialization (replace with your actual models)
const User = require('./models/User');
const FlowRule = require('./models/FlowRule');

// Authentication setup
require('./auth/passport');

// Initialize the server
const app = express();

app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'supersecretkey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Database sync
async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database!');
        await sequelize.sync();
    } catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
}

// Routes setup
const apiRoutes = require('./routes/api');



// Registration
app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      const user = await User.create({ username, email, password });
      res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  });

app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login error', error: err.message });
            }
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'jwtsecretkey', { expiresIn: '1h' });
            return res.json({ message: 'Logged in successfully', token });
        });
    })(req, res, next);
});

// Protect all other /api routes with JWT authentication
app.use('/api', passport.authenticate('jwt', { session: false }), apiRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, initDB };

