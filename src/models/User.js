const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
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
        required: true,
        ref: 'Role',
    },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },

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
    },
    employment_type: {
        type: String,
    },
    joining_date: {
        type: Date,
    },
    availablity_status: {
        type: String,
        default: 'unavailable'
    },
},
    { timestamps: true }
)
userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

// Pre-save hook to hash the password before saving to the database
userSchema.pre('save', async function(next) {
    // Check if the password field is modified (i.e., it's being set or updated)
    if (this.isModified('password')) {
      // Hash the password using bcrypt with a salt rounds of 10
      // The password is hashed asynchronously
      this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Proceed to the next middleware or save operation
    next();
  });
  



module.exports = mongoose.model("User", userSchema);