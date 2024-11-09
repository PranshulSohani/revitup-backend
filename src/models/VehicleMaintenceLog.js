const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const VehicleMaintenceLog  = new mongoose.Schema({
   vehicle_number: { type: String, required: true },
   customer_name: { type: String, required: true },
   address: { type: String}, 
   vehicle_type: { type: String },
   make_and_model: { type: String}, 
   contact_number: { type: String, required: true },
   dob: { type: String, required: true }, 
   seat_pic: { type: String },
   odometer_pic: { type: String}, 
   focus_area_1_pic: { type: String },
   focus_area_2_pic: { type: String },
   vehicle_rc_pic: { type: String },
   vehicle_insurance_policy_pic: { type: String },
});
VehicleMaintenceLog.plugin(mongoosePaginate);
VehicleMaintenceLog.plugin(aggregatePaginate);
module.exports = mongoose.model("VehicleMaintenceLog", VehicleMaintenceLog);
