const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    queueLimit: 0
     connectionLimit: 10,
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL connection error:', error);
    }
}
testConnection();

// Bus Schema
const busSchema = new mongoose.Schema({
  number: { type: String, required: true },
  route: { type: String, required: true },
  stops: [String],
  arrivalTime: String
});

const Bus = mongoose.model('Bus', busSchema);

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      userId: user._id, 
      username: user.username,
      email: user.email 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get buses by stop
app.get('/api/buses', async (req, res) => {
  try {
    const stop = req.query.stop;
    if (!stop) {
      return res.json([]);
    }
    
    // Search buses that include this stop
    const buses = await Bus.find({ 
      stops: { $regex: stop, $options: 'i' } 
    });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all buses
app.get('/api/buses/all', async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    // Add to feedback collection if needed
    res.json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});