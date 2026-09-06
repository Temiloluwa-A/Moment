const mongoose = require('mongoose');

const pendingDeleteSchema = new mongoose.Schema({
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false });

const pinSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    note: { type: String, default: '', maxlength: 300 },
    // Percentage-based (0-100), not pixels — keeps pin placement responsive
    // across screen sizes without needing to know the board's rendered size.
    x: { type: Number, required: true, min: 0, max: 100 },
    y: { type: Number, required: true, min: 0, max: 100 },
    // Small fixed tilt for the corkboard feel, picked once at creation.
    rotation: { type: Number, default: () => Math.round((Math.random() * 10 - 5) * 10) / 10 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
    // Null until someone proposes removing this pin. Deleting a pin needs a
    // 60% quorum of the moment's owner+members — see album.controller.js.
    pendingDelete: { type: pendingDeleteSchema, default: null },
});

const albumSchema = new mongoose.Schema({
    momentId: { type: mongoose.Schema.Types.ObjectId, ref: 'timer', required: true, unique: true, index: true },
    pins: [pinSchema],
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);
