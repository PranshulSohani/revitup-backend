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
    var roles = [
        { role_id: 1, role_name: 'Admin' },
        { role_id: 2, role_name: 'Bay Manager'},
        { role_id: 3, role_name: 'Project Manager'},
        { role_id: 4, role_name: 'Worker' },
        { role_id: 5, role_name: 'CEO' },
        { role_id: 6, role_name: 'Security Guard'},
        { role_id: 7, role_name: 'Service Manager'},
        { role_id: 8, role_name: 'Inventory Manager'},
        { role_id: 9, role_name: 'HR Manager'},
      
      ];
     roles.map(role => {
        var desRoleId = roles.filter(role => role.role_name == this.designation);
        if(desRoleId.length > 0){
            if(desRoleId[0].role_id != this.role_id){
                const error = new Error(`Invalid role_id: ${this.role_id} for ${this.designation}. Please provide a valid role.`);
                return next(error); // Pass an error to prevent saving the document
            }
        }
    });

      

   next();
});

module.exports = mongoose.model("User", userSchema);
