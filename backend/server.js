const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const projectRoutes = require('./routes/projectRoutes');
const inviteRoutes = require('./routes/inviteRoutes');

// Debug middleware - SIMPLIFIED VERSION
app.use((req, res, next) => {
  console.log('\n=== NEW REQUEST ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  next();
});

// Middleware
app.use(cors());
app.use(express.json()); // This parses JSON request bodies
app.use('/api/invites', inviteRoutes);

// Debug middleware after body parsing
app.use((req, res, next) => {
  console.log('Parsed body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Collaborative Workspace API' });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  console.log('Test endpoint body:', req.body);
  res.json({ body: req.body, message: 'Test successful' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});