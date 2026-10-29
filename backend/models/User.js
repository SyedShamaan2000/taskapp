const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be atleast 6 characters"],
  },
  tasks: {
    type: [],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  onlineStatus: {
    type: Boolean,
    default: false,
  },
});

UserSchema.index({ isVerified: 1 });

// Instance method to generate OTP
UserSchema.methods.generateVerificationCode = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.verificationCode = otp;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Instance method to verify OTP
UserSchema.methods.verifyVerificationCode = function (otp) {
  if (!this.verificationCode || !this.verificationCodeExpires) {
    return false;
  }

  if (Date.now() > this.verificationCodeExpires) {
    return false; // OTP expired
  }

  if (this.verificationCode !== otp) {
    return false;
  }

  return true;
};

// Instance method to mark email as verified
UserSchema.methods.markEmailAsVerified = function () {
  this.isVerified = true;
  this.verificationCode = undefined;
  this.verificationCodeExpires = undefined;
};

// Instance method to send verification email
UserSchema.methods.sendVerificationEmail = async function () {
  const emailService = require("../utils/emailService");
  const otp = this.generateVerificationCode();
  await this.save(); // Save the OTP to database
  console.log("Verification email sent to:", this.email);
  console.log("OTP:", otp);
  // await emailService.sendVerificationEmail(this.email, this.name, otp);
  return otp;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
