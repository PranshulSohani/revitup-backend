const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    mobile_number: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    role_id: { type: Number, required: true, ref: 'Role' },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    password: { type: String, required: true },
    refreshtoken: { type: String },
    token: { type: String, default: '' },
    employment_type: { type: String },
    joining_date: { type: Date },
    availablity_status: { type: String, default: 'unavailable' },
    isTokenActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
