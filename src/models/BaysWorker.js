const mongoose = require('mongoose');


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
module.exports = mongoose.model("BaysWorker", BaysWorker);