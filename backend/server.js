const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '✅ RecruitNova Backend is Running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
