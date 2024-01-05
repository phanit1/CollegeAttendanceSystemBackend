// imported express
const express = require('express')
//created a router
const router = express.Router();
//imported twilio
const twilio = require('twilio');
//imported xlsx
const reader = require('xlsx')
// Reading our students data file 
const file = reader.readFile('StudentsData.xlsx')

//storing excel file data into variable
let data = []
const sheets = file.SheetNames
for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]])
    temp.forEach((res) => {
        data.push(res)
    })
}

//uses schemas by these line
const studentsdata = require('./students');
const studentsattendancedata = require('./studentsattendance')
const studentsattendancereportdata = require('./studentattendancereport')

// Twilio credentials
const accountSid = 'AC0ca62b75da323655d6446a18295e6f59';
const authToken = '701e5ec6838d5e616afe6a40f4898999';
const twilioPhoneNumber = '+1 720 262 2359';
const client = twilio(accountSid, authToken);


//post request to post single student data to db
router.post('/poststudent', async (req, res) => {
    try {
        const studentrequestdata = await studentsdata.findOne({ "PinNumber": req.body.PinNumber })
        if (studentrequestdata == null) {
            const user = new studentsdata(req.body);
            await user.save();
            return res.status(200).send("Successfully added")
        }
        else {
            return res.status(409).send("User Already Exists")
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//post request to post students data through excel file to db
router.post('/poststudents', async (req, res) => {
    try {
        for (let i = 0; i < data.length; i++) {
                const user = new studentsdata(data[i]);
                await user.save();
                console.log(user)
            }
            return res.status(200).send("Successfully added")
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//put request to update student data in db
router.put('/students/:pinnumber', async (req, res) => {
    try {
        const pinNumberToUpdate = req.params.pinnumber;
        const updatedStudent = await studentsdata.findOneAndUpdate(
            { "PinNumber": pinNumberToUpdate },
            req.body,
            { new: true } // Returns the updated document
        );

        if (updatedStudent == null) {
            return res.status(404).send("Student not found");
        }

        return res.status(200).send("Student updated successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//delete request to delete student data from db
router.delete('/students/:pinnumber', async (req, res) => {
    try {
        const pinNumberToDelete = req.params.pinnumber;
        const deletedStudent = await studentsdata.findOneAndDelete({ "PinNumber": pinNumberToDelete });

        if (deletedStudent == null) {
            return res.status(404).send("Student not found");
        }

        return res.status(200).send("Student deleted successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

// get request to get the students data from db
router.get('/students', async (req, res) => {
    try {
        const alldetails = await studentsdata.find()
        if(alldetails.length > 0) { // if there are only details
            // console.log(alldetails)
            return res.status(200).send(alldetails)
        }
        else { // if there are no details
            return res.status(404).send("No Data Found")
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

// get request to get the students by year from db
router.get('/students/:year', async(req,res) => {
    try {
        const yearstudents = await studentsdata.find({Year: req.params.year})
        if(yearstudents.length > 0) {
            console.log(yearstudents)
            return res.status(200).send(yearstudents)
        }
        else {
            return res.status(404).send("Student Not Found in "+req.params.year)
        }
    }
    catch(error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

// get request to get the students by department from db
router.get('/students/:department', async(req,res) => {
    try {
        const departmentstudents = await studentsdata.find({Department: req.params.department})
        if(departmentstudents.length > 0) {
            console.log(departmentstudents)
            return res.status(200).send(departmentstudents)
        }
        else {
            return res.status(404).send("Student Not Found in "+req.params.department)
        }
    }
    catch(error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

// get request to get the students by year, dept and section from db
router.get('/students/:year/:section/:department', async(req,res) => {
    try {
        const studentss = await studentsdata.find({Year: req.params.year, Department: req.params.department, Section: req.params.section})
        if(studentss.length > 0) {
            console.log(studentss)
            return res.status(200).send(studentss)
        }
        else {
            return res.status(404).send("No Student Data Found")
        }
    }
    catch(error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//post request to post list of students attendance data to db
router.post('/poststudentsattendance', async (req, res) => {
    try {
        const studentuser = req.body;
        // console.log(studentuser, "request")
        for (let index = 0; index < studentuser.length; index++) {
            const stuelement = studentuser[index];
            const studentattendancerequest = await studentsattendancedata.findOne({ "PinNumber": stuelement.PinNumber, "Date": stuelement.Date });
            const studentrequestdata = await studentsdata.findOne({ "PinNumber": stuelement.PinNumber })
            if (studentrequestdata == null || studentattendancerequest == null) {
                const user = new studentsattendancedata();
                const user1 = studentuser[index];
                user.PinNumber = user1.PinNumber;
                user.AttendanceStatus = user1.AttendanceStatus;
                user.Date = user1.Date;
                console.log(user, "user")
                if (user.AttendanceStatus == false) {
                    const message = await client.messages.create({
                        body: `Dear Parent, Your Son ${studentrequestdata.StudentName} have been marked as absent today on ${user.Date}. Please contact Principal/HOD for further information.`,
                        from: twilioPhoneNumber,
                        to: "+917893434970"
                    });
                    console.log(`Student ${studentrequestdata.StudentName} marked as absent and Message sent to ${studentrequestdata.StudentName}'s Parent with SID: ${message.sid}`);
                    // return res.status(200).send('Student marked as absent, and message sent.');
                }
                else {
                    console.log(`${studentrequestdata.StudentName} marked as present.`)
                    // return res.status(200).send("Student marked as present.")
                }
                user.save();
            }
            else {
                console.log("User Already Exists")
                // return res.status(409).send("User Already Exists")
            }
        }
        return res.status(200).send(studentuser)
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//post request to post single student attendance data to db
router.post('/poststudentattendance', async (req, res) => {
    try {
        const studentattendancerequestdata = await studentsattendancedata.findOne({ "PinNumber": req.body.PinNumber, "Date": req.body.Date })
        const studentrequestdata = await studentsdata.findOne({ "PinNumber": req.body.PinNumber })
        console.log(studentrequestdata)
        console.log(studentattendancerequestdata)
        if (studentrequestdata == null || studentattendancerequestdata == null) {
            const user = new studentsattendancedata(req.body);
            await user.save();
            if (user.AttendanceStatus == false) {
                // const { studentName, phoneNumber } = req.body;
                // Send SMS using Twilio
                const message = await client.messages.create({
                    body: `Dear Parent, Your Son ${studentrequestdata.StudentName} have been marked as absent today on ${req.body.Date}. Please contact Principal/HOD for further information.`,
                    from: twilioPhoneNumber,
                    to: "+917893434970"
                });
                console.log(`Message sent to ${studentrequestdata.StudentName} with SID: ${message.sid}`);
                return res.status(200).send('Student marked as absent, and message sent.');
            }
            else {
                return res.status(200).send("Student marked as present.")
            }
        }
        else {
            return res.status(409).send("User Already Exists")
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

// get request to get all students attendance details from db
router.get('/studentattendance', async (req, res) => {
    try {
        const alldetails = await studentsattendancedata.find()
        if (alldetails.length > 0) { // if there are only details
            console.log(alldetails)
            return res.status(200).send(alldetails)
        }
        else { // if there are no details
            return res.status(404).send("No Data Found")
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

// get request to get all students attendance details by pin number from db
router.get('/studentattendance/:pinnumber', async (req, res) => {
    try {
        const alldetails = await studentsattendancedata.find({ PinNumber: req.params.pinnumber })
        if (alldetails.length > 0) { // if there are only details
            console.log(alldetails)
            return res.status(200).send(alldetails)
        }
        else { // if there are no details
            return res.status(404).send("No Data Found")
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//post request to generate single student attendance report data from db
router.post('/poststudentattendancereport/:pinnumber', async (req, res) => {
    try {
        const studentattendancereportdata = await studentsattendancereportdata.findOne({ "PinNumber": req.params.pinnumber })
        const students = await studentsdata.findOne({ "PinNumber": req.params.pinnumber })
        if (studentattendancereportdata == null || students == null) {
            const user = new studentsattendancereportdata();
            user.PinNumber = students.PinNumber;
            user.StudentName = students.StudentName;
            user.DaysTotal = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber }).count();
            user.DaysPresent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": true }).count();
            user.DaysAbsent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": false }).count();
            console.log(user)
            await user.save();
            return res.status(200).send(`Student ${user.PinNumber} Attendance Report Generated`)
        }
        else {
            return res.status(409).send("Student Attendance Report Already Exists")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})

//get request to get single student attendance report data by pin number from db
router.get('/studentattendancereport/:pinnumber', async (req, res) => {
    try {
        const studentattendancereportdata = await studentsattendancereportdata.findOne({ PinNumber: req.params.pinnumber })
        if (studentattendancereportdata != null) {
            console.log(studentattendancereportdata)
            return res.status(200).send(studentattendancereportdata)
        }
        else {
            return res.status(404).send("Student Attendance Not Found in " + req.params.pinnumber)
        }
    }
    catch (error) { // if database error comes
        console.log(error)
        return res.status(500).send(error)
    }
})

//get request to update single student attendance report data by pin number in db
router.put('/putstudentattendancereport/:pinnumber', async (req, res) => {
    try {
        const studentattendancereportdata = await studentsattendancereportdata.findOne({ "PinNumber": req.params.pinnumber });
        const students = await studentsdata.findOne({ "PinNumber": req.params.pinnumber });

        if (students == null) {
            return res.status(404).send("Student not found");
        }

        if (studentattendancereportdata == null) {
            // If attendance report doesn't exist, create a new one
            const newReport = new studentsattendancereportdata();
            newReport.PinNumber = students.PinNumber;
            newReport.StudentName = students.StudentName;
            newReport.DaysTotal = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber }).count();
            newReport.DaysPresent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": true }).count();
            newReport.DaysAbsent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": false }).count();
            console.log(newReport);
            await newReport.save();
            return res.status(201).send(`Student ${newReport.PinNumber} Attendance Report Created`);
        } else {
            // If attendance report exists, update it
            studentattendancereportdata.DaysTotal = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber }).count();
            studentattendancereportdata.DaysPresent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": true }).count();
            studentattendancereportdata.DaysAbsent = await studentsattendancedata.find({ "PinNumber": req.params.pinnumber, "AttendanceStatus": false }).count();
            console.log(studentattendancereportdata);
            await studentattendancereportdata.save();
            return res.status(200).send(`Student ${studentattendancereportdata.PinNumber} Attendance Report Updated`);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

module.exports = router