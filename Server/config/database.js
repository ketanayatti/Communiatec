const mongoose = require("mongoose");
const dns = require("dns");

// Set DNS servers to Google's public DNS to ensure connectivity
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dbConnect = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn(
        "⚠️ DATABASE_URL is not defined in environment variables. Database features will be disabled."
      );
      return;
    }

    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if cannot connect
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    console.warn(
      "⚠️ Server starting without database connection. Some features may be unavailable."
    );
    // Do NOT exit process, allow server to start for health checks
  }
};

module.exports = dbConnect;
