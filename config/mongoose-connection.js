const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

module.exports = mongoose.connection;
