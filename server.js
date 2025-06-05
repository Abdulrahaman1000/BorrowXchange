const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/admin'); 

dotenv.config();
const app = express();
connectDB();

app.use(express.json());


app.use('/api', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminRoutes); 


app.get('/', (req, res) => {
  res.send('Wallet API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
