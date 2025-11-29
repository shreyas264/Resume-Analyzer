require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const analyzeRouter = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', analyzeRouter);

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();

