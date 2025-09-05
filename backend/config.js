require('dotenv').config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-workspace',
  JWT_SECRET: process.env.JWT_SECRET || 'AshwithaChandru*1',
  PORT: process.env.PORT || 5000
};