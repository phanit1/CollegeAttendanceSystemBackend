const mongoose = require("mongoose");

const studentattendancereport = mongoose.Schema({
    PinNumber : {
        type : String,
        required : true,
    },
    StudentName : {
        type : String,
        required : true,
    },
    DaysPresent : {
        type : Number,
        required: true
    },
    DaysAbsent : {
        type : Number,
        required: true
    },
    DaysTotal : {
        type : Number,
        required: true
    }    
})

module.exports = mongoose.model("studentsattendancereportdata", studentattendancereport);