const mongoose = require('mongoose');

const rootSchema = new mongoose.Schema({
    timerId: {type:String, required:true, unique:true},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
}, {timestamps:true})


const memberSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:'user' },
    timerId: {type:String, required:true},
    joinedAt: {type:Date, default:Date.now}
}, {_id:false})

const groupSchema = new mongoose.Schema({
    createdby: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    member: {type:memberSchema},
    title: {type:String, maxlength:80, required:true},
    slug: {type:String, required:true, unique:true} //matches the timer slug

}, {timestamps:true})
const Shared = mongoose.model("Shared", groupSchema)
const Root = mongoose.model("Root", rootSchema)
module.exports = {Root, Shared}
//