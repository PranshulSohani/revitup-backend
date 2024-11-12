const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const attendanceSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to the User model
        required: true
    },
    check_in_date_time: {
        type: Date, // corrected data type
        required: true
    },
    check_out_date_time: {
        type: Date, // corrected data type
    }
},
    { timestamps: true }
);
attendanceSchema.plugin(mongoosePaginate);
attendanceSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("EmployeeAttendance", attendanceSchema);
