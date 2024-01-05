const mongoose = require("mongoose");

const studentattendancedata = mongoose.Schema({
    PinNumber : {
        type : String,
        required : true,
    },
    // SubjectName : {
    //     type : String,
    //     required : true,
    // },
    AttendanceStatus : {
        type : Boolean,
        required : true,
    },
    Date : {
        type : Date,
        required : true,
    }    
})

module.exports = mongoose.model("studentsattendancedata", studentattendancedata);