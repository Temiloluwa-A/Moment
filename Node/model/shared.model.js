const mongoose = require('mongoose');

const rootSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:'user', required: true},
    timerId: {type:String, required:true, unique:true}
}, {timestamps:true})

rootSchema.index({ timerId:1, userId:1  }, { unique: true})
//one root per user per timer

const memberSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:'user', required: true},
    timerId: {type:String, required:true},
    joinedAt: {type:Date, default:Date.now}
}, {_id:false})


const groupSchema = new mongoose.Schema({
    createdby: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    member: {type:memberSchema},
    title: {type:String, maxlenght:80, required:true},
    slug: {type:String, required:true, unique:true} //matches the timer slug

}, {timestamps:true})

module.exports = ("shared", groupSchema) 