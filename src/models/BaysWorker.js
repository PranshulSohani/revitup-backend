const mongoose = require('mongoose');


const BaysWorker = new mongoose.Schema({
    worker_id: {
        type: String,
        required: true
    },
    bay_id: {
        type: String,
        required: true,
    }
},
    { timestamps: true }
)
module.exports = mongoose.model("BaysWorker", BaysWorker);