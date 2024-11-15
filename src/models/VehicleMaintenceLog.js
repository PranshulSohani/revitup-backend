const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const VehicleMaintenceLog = new mongoose.Schema({
   vehicle_number: { type: String, required: true },
   customer_name: { type: String, required: true },
   address: { type: String },
   pin_code: { type: String },
   email: { type: String },
   visit_type: { type: String },
   vehicle_type: { type: String },
   make_and_model: { type: String },
   contact_number: { type: String, required: true },
   dob: { type: String, required: true },
   booking_number: { type: String },
   gst_number: { type: String },
   vehicle_reg_no: { type: String },
   vin_no: { type: String },
   engine_no: { type: String },
   model_no: { type: String },
   sold_by: { type: String },
   sold_date: { type: Date },
   odo: { type: Number },
   color_name: { type: String },
   work_type: { type: String },
   ro_date: { type: Date },
   ro_number: { type: String },
   printing_time: { type: String }, 
   special_message: { type: String },
   ac_filter: { type: String },
   brakes: { type: String },
   air_filter: { type: String },
   engine_oil: { type: String },
   service_type: { type: String },       
   customer_request: { type: String },   
   additional_description: { type: String },
   expected_delivery_date: { type: Date },
   expected_delivery_time: { type: String },

   // Picture fields
   seat_pic: { type: String },
   odometer_pic: { type: String },
   focus_area_1_pic: { type: String },
   focus_area_2_pic: { type: String },
   vehicle_rc_pic: { type: String },
   vehicle_insurance_policy_pic: { type: String },
   vehicle_rear_pic: { type: String },
   vehicle_right_pic: { type: String },
   vehicle_left_pic: { type: String },
   vehicle_front_pic: { type: String },
 }, { timestamps: true });

VehicleMaintenceLog.plugin(mongoosePaginate);
VehicleMaintenceLog.plugin(aggregatePaginate);
module.exports = mongoose.model("VehicleMaintenceLog", VehicleMaintenceLog);
