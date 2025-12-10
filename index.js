require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/contests', require('./routes/contest'));
app.use('/api/users', require('./routes/user'));
app.use('/api/participations', require('./routes/participation'));
app.use('/api/payments', require('./routes/payment'));

app.get('/', (req, res) => {
  res.json({ message: 'ContestSphere API Running' });
});

app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
