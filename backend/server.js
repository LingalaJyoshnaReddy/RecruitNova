const express        = require('express');
const cors           = require('cors');
const dotenv         = require('dotenv');
const authRoutes     = require('./routes/authRoutes');
const companyRoutes  = require('./routes/companyRoutes');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', require('express').static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/roles',       require('./routes/rolesRoutes'));
app.use('/api/permissions', require('./routes/permissionsRoutes'));
app.use('/api/drives',       require('./routes/drivesRoutes'));
app.use('/api/jobs',         require('./routes/jobsRoutes'));
app.use('/api/applications', require('./routes/applicationsRoutes'));
app.use('/api/interviews',   require('./routes/interviewsRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '✅ RecruitNova Backend is Running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
