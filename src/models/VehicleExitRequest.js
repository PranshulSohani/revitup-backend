const mongoose = require('mongoose');

const VehicleExitRequestSchema = new mongoose.Schema({
    status: { type: String, default: "Pending" }, // Default status set to "Pending"
    vehicle_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleLog', required: false }, // Reference to User model

});

module.exports = mongoose.model("VehicleExitRequest", VehicleExitRequestSchema);
