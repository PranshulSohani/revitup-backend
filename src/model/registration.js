const mongoose = require('mongoose');

const Registration = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    designation: {
        type: String,
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


const UserRegistration = new mongoose.model("Registration", Registration)


module.exports = UserRegistration;