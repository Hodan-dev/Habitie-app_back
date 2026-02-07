const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));

// Middleware
// U ogolow CORS iyo Authorization header si Flutter Web uu u shaqeeyo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Passport config
require('./config/passport')();

// Database connection
// Isku xidhka database-ka MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Database-ka waa la xidhay si fiican'))
.catch((err) => console.error('Qalad database-ka: ', err));

// Routes
// Waa halka ay socdaan dhammaan API endpoints-ka
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error handling middleware
// Haddii ay dhacdo qalad, waa halkan loo soo celinayaa
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint-kaan ma heli karo' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server-ka waa socdaa port-ka ${PORT}`);
});
