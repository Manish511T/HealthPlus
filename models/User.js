const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic info
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String },

  // Medical profile — shown to responders in an emergency
  age:               { type: Number },
  bloodGroup:        { type: String },           // e.g. "A+", "O-"
  medicalConditions: { type: [String], default: [] }, // e.g. ["diabetes", "asthma"]

  // Role determines what the user can do in the app
  role: {
    type:    String,
    enum:    ['citizen', 'volunteer', 'healthcenter', 'admin'],
    default: 'citizen'
  },

  // CRITICAL: This stores the user's last known GPS location
  // MongoDB uses GeoJSON format: { type: "Point", coordinates: [longitude, latitude] }
  // Note: longitude comes FIRST in GeoJSON (opposite of what you might expect)
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },

  fcmToken:   { type: String },             // Device token for push notifications
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true }

}, { timestamps: true }); // automatically adds createdAt and updatedAt fields

// This index is what makes geospatial queries possible
// Without it, the $nearSphere query will throw an error
userSchema.index({ location: '2dsphere' });

// Before saving a user, hash their password
// "hashing" = turning "mypassword123" into "$2b$12$abc..." so it can never be reversed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if password changed
  this.password = await bcrypt.hash(this.password, 12);

});

// Method to check if a login password matches the stored hash
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);