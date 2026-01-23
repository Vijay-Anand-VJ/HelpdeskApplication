const bcrypt = require("bcryptjs");

const users = [
  {
    name: "Super Admin",
    email: "admin@helpdesk.com",
    password: "password123", // The script will encrypt this automatically? 
    // WAIT! The model encrypts on .save(), but insertMany might skip hooks depending on setup.
    // Let's manually hash it here to be safe for a seeder.
    role: "Super Admin",
    title: "System Owner",
    department: "IT",
    isActive: true,
  }
];

// We need to hash the password manually since insertMany doesn't always trigger the 'pre-save' hook in the model
const getUsersWithHash = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    
    users[0].password = hashedPassword;
    return users;
};

module.exports = users;