const mongoose = require("mongoose");

const student = mongoose.Schema({
    PinNumber : {
        type : String,
        required : true,
    },
    StudentName : {
        type : String,
        required : true,
    },
    CollegeCode : {
        type : Number,
        required : true,
    },
    Department : {
        type : String,
        required : true,
    },
    Year : {
        type : String,
        required : true,
    },
    Section : {
        type : String,
        required : true,
    },
    ParentPhoneNumber : {
        type : Number,
        required: true
    }    
})

// Pin Number, Sub Name, Attended or Not, Date, 
module.exports = mongoose.model("studentsdata", student);