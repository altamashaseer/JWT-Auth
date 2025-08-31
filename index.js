// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');


const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.DB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


// --- Helper Functions ---

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
}

// --- Middleware ---

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      // Differentiate between expired token and invalid token
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  });
}

// --- Routes ---

// 1. User Registration
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      password: hashedPassword
    });

    await user.save();
    console.log('User saved:', user);
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});


// 2. User Login -> Returns Access and Refresh Tokens
app.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid username or password');
    }

    // User credentials are correct. Generate tokens.
    const userPayload = { name: user.username };
    const accessToken = generateAccessToken(userPayload);

    const refreshToken = jwt.sign(userPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    
    // Store the refresh token in the database
    user.refreshTokens.push(refreshToken);
    await user.save();
    console.log('refreshToken :', refreshToken);

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send(error.message);
  }
});

// 3. Token Refresh - Generate New Access Token using Refresh Token
app.post('/token', async (req, res) => {
  const { token: refreshToken } = req.body;

  if (refreshToken == null) return res.sendStatus(401);

  try {
    const userInDb = await User.findOne({ refreshTokens: refreshToken });
    if (!userInDb) return res.status(403).send('Invalid Refresh Token');

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err || userInDb.username !== user.name) return res.status(403).send('Invalid Refresh Token');

      // The refresh token is valid, create a new access token
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).send(error.message);
  }
});

// 4. Logout -> Invalidate Refresh Token
app.delete('/logout', async (req, res) => {
  const { token: refreshToken } = req.body;
  // Remove the refresh token from the user's record in the database
  await User.updateOne({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } });
  res.status(204).send('Logged out successfully');
});

// 5. Protected Route
app.get('/profile', authenticateToken, (req, res) => {
  // The `authenticateToken` middleware has already run and verified the JWT.
  // The user's payload is attached to req.user.
  res.json({
    message: `Welcome, ${req.user.name}! This is protected data.`,
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
