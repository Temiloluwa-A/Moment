const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    userName:{type: String, required: true},
    password:{type: String, required: true},
    email:{type: String, required: true, unique: true, lowercase: true},
    gender:{type: String, enum:["male", "female"]},
    // age:{type: Number, required: true},
}, {timestamps: true, strict: "throw"})



const User = mongoose.model("User", userSchema)

module.exports = User;