// imported express
const express = require('express')
//created a router
const router = express.Router();
// imported express
const reader = require('xlsx')
//used schema by this line
const studentsdata = require('./students')
// Reading our test file 
const file = reader.readFile('./StudentsData.xlsx')

let data = []

const sheets = file.SheetNames

for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]])
    temp.forEach((res) => {
        data.push(res)
    })
}
//post request to post data to db
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

// get request to get the details by name from db
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

module.exports = router