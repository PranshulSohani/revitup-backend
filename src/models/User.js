const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const User = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile_number: {
        type: String,
        required: true,
        unique: true,
    },
    designation: {
        type: String,
        required: true
    },
    role_id: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshtoken: {
        type: String
    },
    token: {
        type: String,
        default: ''
    }
},
    { timestamps: true }
)
User.plugin(mongoosePaginate);
User.plugin(aggregatePaginate);
module.exports = mongoose.model("User", User);