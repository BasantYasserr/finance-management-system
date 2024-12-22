import express from 'express';
import { User } from '../../DB/models/user.js';
import { generateToken } from '../config/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
  
const router = express.Router(); 

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role, department } = req.body; // Adjust based on your request payload

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new user with the hashed password
    const user = new User({
      email,
      password: hashedPassword, // Save the hashed password
      username,
      role,
      department
    });

    // Save the user to the database
    await user.save();

    // Generate a token (Assuming you have a method for generating JWT token)
    const token = generateToken(user);

    // Respond with the user data and token
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = generateToken(user);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a real implementation, you might want to invalidate the token
    // or add it to a blacklist
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email (implementation needed)
    
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;