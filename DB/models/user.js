import mongoose from 'mongoose';
import { comparePasswords } from '../../src/config/auth.js';

class UserClass {
  // Instance methods
  async verifyPassword(password) {
    return await comparePasswords(password, this.password);
  }

  // Remove sensitive data before sending to client
  toJSON() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
  }

  // Check if user has specific permission
  hasPermission(permissionName) {
    return this.permissions.includes(permissionName);
  }
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'doctor', 'manager', 'finance_staff'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Not Active'],
    default: 'Not Active'
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Load instance methods
userSchema.loadClass(UserClass);

// Static methods
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await user.verifyPassword(password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return user;
};

export const User = mongoose.model('User', userSchema);