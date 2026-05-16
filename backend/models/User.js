const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String },
  savedListings: { type: Array, default: [] }, 
  trashListings: { type: Array, default: [] }, 
  atsHistory: { type: Array, default: [] }    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);