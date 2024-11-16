const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Define the WorkersTask schema
const workersTaskSchema = new mongoose.Schema({
  project_manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  project_name: { type: String, required: true },
  job_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleMaintenceLog', required: true },
  task_description: { type: String, required: true },
}, { timestamps: true });

// Add plugins for pagination
workersTaskSchema.plugin(mongoosePaginate);
workersTaskSchema.plugin(aggregatePaginate);

// Export the model
module.exports = mongoose.model('WorkersTask', workersTaskSchema);
