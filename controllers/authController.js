const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// Helper: create a JWT token for a user
// The token contains the user's ID and expires in 30 days
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, age, bloodGroup, medicalConditions, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create the user (password gets hashed automatically via the model's pre-save hook)
    const user = await User.create({
      name, email, password, phone, age, bloodGroup, medicalConditions, role
    });

    // Send back the token and basic user info
    res.status(201).json({
      token: createToken(user._id),
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        bloodGroup: user.bloodGroup
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.json({
      token: createToken(user._id),
      user: {
        _id:               user._id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        bloodGroup:        user.bloodGroup,
        medicalConditions: user.medicalConditions
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/auth/location  (called by the PWA every few seconds when app is open)
exports.updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, fcmToken } = req.body;

    const update = {
      location: { type: 'Point', coordinates: [longitude, latitude] }
    };
    if (fcmToken) update.fcmToken = fcmToken; // Save new device token if provided

    await User.findByIdAndUpdate(req.user._id, update);
    res.json({ message: 'Location updated' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me  (get the logged-in user's profile)
exports.getMe = async (req, res) => {
  res.json(req.user);
};