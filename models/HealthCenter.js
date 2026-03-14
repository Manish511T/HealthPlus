const mongoose = require('mongoose');

const healthCenterSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  contactNumber: { type: String, required: true },
  address:       { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  fcmToken: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

healthCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HealthCenter', healthCenterSchema);