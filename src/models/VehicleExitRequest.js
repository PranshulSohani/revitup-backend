const mongoose = require('mongoose');

const VehicleExitRequestSchema = new mongoose.Schema({
    status: { type: String, default: "Pending" }, // Default status set to "Pending"
});

module.exports = mongoose.model("VehicleExitRequest", VehicleExitRequestSchema);
