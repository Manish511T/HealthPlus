const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  // Who triggered the emergency
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',    // links to the User model
    required: true
  },

  // Where the emergency happened (GeoJSON format)
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },

  // Lifecycle status — moves from active → accepted → resolved
  status: {
    type:    String,
    enum:    ['active', 'accepted', 'resolved', 'cancelled'],
    default: 'active'
  },

  // Optional media captured at the moment of emergency
  voiceUrl: { type: String }, // Cloudinary URL for voice recording
  imageUrl: { type: String }, // Cloudinary URL for photo

  // Information about the device used (battery level, model, etc.)
  deviceInfo: { type: Object },

  // Who accepted the emergency request
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  acceptedAt:  { type: Date },
  resolvedAt:  { type: Date },

  // List of users who were notified (so we don't spam them again)
  notifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

emergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', emergencySchema);