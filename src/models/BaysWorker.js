const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const BaysWorker = new mongoose.Schema({
    worker_id: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    job_card_id: {
        required: true,
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'VehicleMaintenceLog',

    }
},
    { timestamps: true }
)

BaysWorker.plugin(mongoosePaginate);
BaysWorker.plugin(aggregatePaginate);
module.exports = mongoose.model("BaysWorker", BaysWorker);