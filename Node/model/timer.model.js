const mongoose = require ('mongoose');

const backgroundSchema = new mongoose.Schema({
    type: {type: String, enum:["solid", "gradient", "image"], required: true},
    value: {type: String, required:true},
    publicId: {type:String, default:null},
}, {_id:false})
// _id is false so mongodb doesn't create a sub-object since its a small part of something big


const borderStyleSchema = new mongoose.Schema({
    width: {type:Number, default:1},
    color: {type: String, default:'transparent'},
    style: {type: String, enum:['solid', 'dotted', 'dashed'], default:'solid'}

}, {_id:false})


const triggerSchema = new mongoose.Schema({
    type: {type:String, enum:['preset', 'custom'], required:true},
    preset: {type:String, default:null, required:true}, //check back and make it the confetti rain 
    //you checked,  you didn't because null lets you be able to set anything later
    media: {
        secure_url: {type:String, default:null},
        publicId: {type:String, default:null},
        resourceType: {type:String, enum:['image', 'video'], default:null}
    }
}, {_id:false})


const customizationSchema = new mongoose.Schema({
    // timerId:{}
    font: {type: String, default:'Cormorant Garamond'}, // change when you check fonts used in stitch
    background: {type:backgroundSchema, default:{
        type: 'solid',
        value: '#1a2b3c' // change with stitch
    }},
    timerSize: {type:Number, default:80},
    borderRadius: {type:Number, default:15},
    borderStyle: {type:borderStyleSchema, default:{}}, //empty {} allows to use default settings already made n borderstyleschema
    mood: {type:String, default:null}, //should i add enum for hopeful and the others and have an empty string
    moodNote: {type:String, default:'', maxlength:400},
    trigger: {type:triggerSchema, default: {
        type:'preset',
        preset:'confetti',
        custom:null
    }}
    
})


const timerSchema = new mongoose.Schema ({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true},
    // no unique true because that simply means one timer per user and we want multiple timers per user but we still want an index for faster searching through timers that belong to a specific user
    slug: {type:String, required:true, unique:true},
    mode: {type:String, required:true, enum:["countup", "countdown"]},
    title: {type:String, default: '', maxlength: 80},
    startAt: {type:Date, default:Date.now, required:true},
    // Removed required:true so Count-Ups can successfully save with no milestone!
    endAt: {type:Date, default: null},
    timeZone: {type:String, required:true},
    units:{
        days: {type:Boolean, default:true},
        hours: {type:Boolean, default:true},
        minutes: {type:Boolean, default:true},
        seconds: {type:Boolean, default:true},
    },
    isGift: {type:Boolean, default:false},
    isPublic: {type:Boolean, default:false},
    rootCount: {type:Number, default: 0},
    notify: {type:Boolean, default:true},
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    customization: {type:customizationSchema, default:{}}
}, {timestamps:true})
 
// timerSchema.index({userId: 1}) //creates an index on userId field in ascending order,it
// //pulls all timers belonging to that specific id without earching through everyoneelde's data
// timerSchema.index({slug: 1}, {unique:true})

// Both fields must go in the first object to create a valid compound index!
timerSchema.index({ isPublic: 1, rootCount: -1 })
// This index allows us to efficiently query for public timers sorted by rootCount in descending order, which is useful for features like displaying popular public timers.


const timer = mongoose.model("timer", timerSchema)

module.exports = timer