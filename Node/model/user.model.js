const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName:{type: String, required: true},
    userName:{type: String, required: true},
    gender:{type: String, enum:["male", "female"], set: (val) => val?.toLowerCase().trim()},
    password:{type: String, required: true},
    email:{type: String, required: true, unique: true, lowercase: true},
    avatarStyle:{type: String, default:'lorelei'},
   
}, {timestamps: true, strict: "throw"})



const User = mongoose.model("User", userSchema)

module.exports = User;