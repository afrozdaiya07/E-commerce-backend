const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google DNS for SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;