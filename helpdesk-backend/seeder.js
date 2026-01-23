const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Delete everything first (start fresh)
    await User.deleteMany();

    // 2. Create the Admin User
    // We use .create() so it runs the encryption code in User.js
    await User.create({
      name: "Super Admin",
      email: "admin@helpdesk.com",
      password: "password123", // This will get encrypted automatically
      role: "Super Admin",
      title: "System Owner",
      department: "IT",
    });

    console.log("✅ Admin User Created!");
    console.log("👉 Email: admin@helpdesk.com");
    console.log("👉 Password: password123");
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();