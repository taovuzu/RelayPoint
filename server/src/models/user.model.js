import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }, 
  
  password: {
    type: String,
    required: function () {
      return !this.loginType || this.loginType.includes("EMAIL_PASSWORD");
    }
  },
  loginType: {
    type: [String],
    enum: ["EMAIL_PASSWORD", "GOOGLE", "FACEBOOK"],
    default: ["EMAIL_PASSWORD"]
  },
  googleId: {
    type: String,
    sparse: true
  },
  refreshToken: {
    type: String
  },
  forgetPasswordToken: {
    type: String
  },
  forgetPasswordExpiry: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      plan: this.plan,
      subscription: {
        status: this.subscription?.status || 'INACTIVE',
        plan: this.subscription?.plan || this.plan || 'FREE',
        endDate: this.subscription?.endDate || null
      }
      
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.
  createHash("sha256").
  update(unHashedToken).
  digest("hex");
  const tokenExpiry = new Date(Date.now() + Number(process.env.USER_PASSWORD_EXPIRY));

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);