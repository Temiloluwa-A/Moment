const mongoose = require ('mongoose');

const backgroundSchema = new mongoose.Schema({
    type: {type: String, enum:["solid", "gradient", "wallpaper", "image"], required: true},
    value: {type: string, required:true}
}, {_id:false})
// _id is false so mongodb doesn't create a sub-object since its a small part of something big


const borderStyleSchema = new mongoose.Schema({
    width: {type:Number, default:1},
    color: {type:string, default:'transparent'},
    style: {type:string, enum:['solid', 'dotted', 'dashed'], default:solid}

}, {_id:false})


const triggerSchema = new mongoose.Schema({
    type: {type:String, enum:['preset', 'custom'], required:true},
    preset: {type:String, default:null, required:true}, //check back and make it the confetti rain 
    //you checked,  you didn't because null lets you be able to set anything later
    custom: {type:String, default:null}
}, {_id:false})


const customizationSchema = new mongoose.Schema({
    font: {type:string, default:'Cormorant Garamond'}, // change when you check fonts used in stitch
    backgound: {type:backgroundSchema, default:{
        type: 'solid',
        value: '#1a2b3c' // change with stitch
    }},
    timerSize: {type:Number, default:80},
    borderRadius: {type:Number, default:15},
    borderStyle: {type:borderStyleSchema, default:{}}, //empty {} allows to use default settings already made n borderstyleschema
    mood: {type:String, default:null}, //should i add enum for hopeful and the others and have an empty string
    moodNote: {type:String, default:'', maxlength:280},
    trigger: {type:triggerSchema, default: {
        type:'preset',
        preset:'confetti',
        custom:null
    }}
    
})


const timerSchema = new mongoose.Schema ({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:"user", required:true, unique:true, index:true},
    slug: {type:String, required:true, unique:true},
    mode: {type:String, required:true, enum:["countup", "countdown"]},
    title: {type:String, default: '', maxlength: 80},
    startAt: {type:Date, default:Date.now, required:true},
    endAt: {type:Date, required:true, default: null},
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
    notify: {type:Boolean, deafult:true},
    customization: {type:customizationSchema, default:{}}
}, {timestamps:true})
 
timerSchema.index({userId: 1}) //creates an index on userId field in ascending order,it
//pulls all timers belonging to that specific id without earching through everyoneelde's data
timerSchema.index({slug: 1}, {unique:true})

timerSchema.index({rootCount: -1}, {isPublic:1})
//with index instead of the database reading through every single document it does it 
//collection scan by looking at a sorted list and jumps straight to the data to 
//be found 


const timer = mongoose.model("timer", timerSchema)

module.exports = timer