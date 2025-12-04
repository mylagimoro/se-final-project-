const app = require('./src/app');
const connectDB = require('./src/config/db');

// Load env vars - only load once at the entry point
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PORT = process.env.PORT || 3000;

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    console.log(`Database connected successfully to: ${process.env.MONGODB_URI.split('@')[1].split('.')[0]}`);
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base URL: http://localhost:${PORT}`);
      console.log(`Available endpoints:`);
      console.log(`  GET  /api/patients`);
      console.log(`  GET  /api/doctors`);
      console.log(`  GET  /api/appointments`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Unhandled Rejection: ${err.message}`);
      console.log(err.stack);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
};

startServer();