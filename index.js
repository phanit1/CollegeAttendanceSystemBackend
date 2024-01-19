// importing express
const express = require("express")
// importing body  parser
const bodyParser = require("body-parser")
// importing mongoose for databse connection
const mongoose = require("mongoose")

const app = express()
const url = "mongodb+srv://ppaproject:Teamwork12@sample-sxout.mongodb.net/CollegeAttendance?retryWrites=true&w=majority"; // setting mongodb database url
const cors = require("cors")

// //to use router we need to import
// const authRouters = require('./studentroute')
const authRouters = require('./studentattendanceroute')
const authRouters1 = require('./userroute')

app.use(cors())
app.use(bodyParser.json())
// app.use(authRouters)
app.use(authRouters)
app.use(authRouters1)

mongoose.connect(url)

// connecting database
mongoose.connection.on("connected", () => {
    console.log("connected to mongo")
})

// database connection error
mongoose.connection.on("error", (err) => {
    console.log("this is error", err)
})

// connecting port 
app.listen(3000 ,() => {
    console.log("server running")
})