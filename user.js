const mongoose = require("mongoose");

const user = mongoose.Schema({
    username: String,
    password: String,
    role: String // 'admin' or 'student'
  });

  module.exports = mongoose.model("usersdata", user);