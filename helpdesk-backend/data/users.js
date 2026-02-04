const bcrypt = require("bcryptjs");

const users = [
  {
    name: "Super Admin",
    email: "admin@helpdesk.com",
    password: "password123", 
    role: "Super Admin",
    title: "System Owner",
    department: "IT",
    isActive: true,
  }
];

// NUCLEAR FIX: Export the hashed version to ensure seeder compatibility
const getSeededUsers = async () => {
    const salt = await bcrypt.genSalt(10);
    // Map through all users in case you add more staff/agents later
    return await Promise.all(users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
    }));
};

module.exports = getSeededUsers;