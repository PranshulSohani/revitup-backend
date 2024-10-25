const mongoose = require('mongoose');

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

module.exports = mongoose.model("User", User);