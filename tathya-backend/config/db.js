// tathya-backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tathya_db';
    console.log('Connecting to MongoDB using URI:', mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      // The following options may be unnecessary depending on mongoose version,
      // but `family: 4` forces IPv4 to avoid attempts to connect to ::1 on some systems.
      family: 4,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Make sure MongoDB is running or set MONGO_URI to a reachable database.');
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;