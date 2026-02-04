const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @desc User Schema
 * Defines the structure for user accounts in the database.
 */
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true, // Ensures no duplicate emails
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    role: {
      type: String,
      enum: ["Customer", "Agent", "Manager", "Admin", "Super Admin"], // Restricted list of roles
      default: "Customer",
    },
    department: {
      type: String, // E.g., IT, HR, Legal
      default: "General",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"], // Used for banning logic
      default: "Active",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * @desc  Password Encryption Middleware
 *        Runs automatically before 'save'.
 *        Hashes the password using bcryptjs if it has been modified.
 */
userSchema.pre('save', async function (next) {
  // If password is not modified (e.g. only updating name), skip hashing
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @desc  Verify Password Method
 *        Compares entered plaintext password with hashed password in DB.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);