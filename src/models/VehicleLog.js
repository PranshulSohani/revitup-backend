const mongoose = require('mongoose');

const VehicleLog  = new mongoose.Schema({
   vehicle_number: { type: String, required: true },
   entry_for: { type: String, enum: ['service', 'test drive', 'delivery', 'pickup'], required: true },
   entry_time: { type: Date, default: Date.now }, // Stores both date and time for entry
   exit_time: { type: Date }, // Stores both date and time for exit
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Reference to User model
});

module.exports = mongoose.model("VehicleLog", VehicleLog);
