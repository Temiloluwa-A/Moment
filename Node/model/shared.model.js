const mongoose = require('mongoose');

const rootSchema = new mongoose.Schema({
    timerId: {type:String, required:true, unique:true},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps:true})

const Root = mongoose.model("Root", rootSchema)
module.exports = {Root}