const Timer = require('../model/timer.model');
const Album = require('../model/album.model');
const AppError = require('../utils/AppError');
const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');
const { cloudinary } = require('../middleware/cloudinary');

// A count-up moment has no natural end date, so its album is capped by board
// capacity instead — not a user-configurable field, just "the board is full."
const MAX_PINS = 60;
// A delete vote that never reaches quorum auto-rejects after this long — the
// pin simply stays, nobody has to explicitly resolve it.
const PENDING_DELETE_EXPIRY_HOURS = 60;

const isOwnerOrMember = (moment, userId) =>
    moment.userId.toString() === userId || (moment.members || []).some((m) => m.toString() === userId);

const requiredVotes = (moment) => Math.ceil((1 + (moment.members || []).length) * 0.6);

// Countdown-attached: open while the countdown is still running (mirrors the
// moment's own lifecycle — it seals into a read-only keepsake once it ends).
// Count-up-attached: open until the board fills up. Either way, once the
// owner's account is gone nobody's left to manage it, so it seals regardless —
// a count-up album has no endAt to fall back on for that case.
const isOpenForContributions = (moment, album) => {
    if (moment.ownerDeleted) return false;
    if (moment.mode === 'countdown') {
        return !moment.endAt || new Date() < new Date(moment.endAt);
    }
    return album.pins.length < MAX_PINS;
};

// Clears any pendingDelete older than the expiry window before the album is
// read or mutated — no separate cron job needed for this, just checked
// wherever the album is touched. Returns whether anything changed.
const expireStalePendingDeletes = (album) => {
    const cutoff = Date.now() - PENDING_DELETE_EXPIRY_HOURS * 60 * 60 * 1000;
    let changed = false;
    for (const pin of album.pins) {
        if (pin.pendingDelete && new Date(pin.pendingDelete.requestedAt).getTime() < cutoff) {
            pin.pendingDelete = null;
            changed = true;
        }
    }
    return changed;
};

const findMomentOrThrow = async (slug) => {
    const moment = await Timer.findOne({ slug });
    if (!moment) throw new AppError(404, 'Moment not found');
    return moment;
};

const findOrCreateAlbum = async (momentId) => {
    let album = await Album.findOne({ momentId });
    if (!album) {
        album = await Album.create({ momentId, pins: [] });
    }
    return album;
};

// Shapes one pin for the API response — adds the computed vote context a
// static schema field can't hold (whether it survived expiry, whether *this*
// viewer has already voted) without duplicating it in the stored document.
const serializePin = (pin, moment, viewerId) => {
    const votes = pin.pendingDelete?.votes || [];
    return {
        _id: pin._id,
        imageUrl: pin.imageUrl,
        note: pin.note,
        x: pin.x,
        y: pin.y,
        rotation: pin.rotation,
        addedBy: pin.addedBy,
        addedAt: pin.addedAt,
        pendingDelete: pin.pendingDelete
            ? {
                currentVotes: votes.length,
                requiredVotes: requiredVotes(moment),
                hasVoted: viewerId ? votes.some((v) => v.toString() === viewerId) : false,
            }
            : null,
    };
};

const getAlbum = async (req, res) => {
    const moment = await findMomentOrThrow(req.params.slug);
    const album = await findOrCreateAlbum(moment._id);

    if (expireStalePendingDeletes(album)) {
        await album.save();
    }
    await album.populate('pins.addedBy', 'userName avatarStyle');

    res.status(200).send({
        message: 'Album fetched successfully',
        data: {
            isOpen: isOpenForContributions(moment, album),
            maxPins: moment.mode === 'countup' ? MAX_PINS : null,
            pins: album.pins.map((pin) => serializePin(pin, moment, req.user?.id)),
        },
    });
};

const addPin = async (req, res) => {
    const moment = await findMomentOrThrow(req.params.slug);
    if (!isOwnerOrMember(moment, req.user.id)) {
        throw new AppError(403, 'Only the owner or a collaborator can add to this album');
    }

    const album = await findOrCreateAlbum(moment._id);
    if (!isOpenForContributions(moment, album)) {
        throw new AppError(400, moment.mode === 'countdown' ? 'This countdown has ended — the board is sealed.' : 'This board is full.');
    }

    if (!req.file) {
        throw new AppError(400, 'An image is required.');
    }

    const uploadResult = await uploadBufferToCloudinary(req.file, { folder: 'album_pins', resource_type: 'image' });

    album.pins.push({
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        note: (req.body.note || '').slice(0, 300),
        // Random initial placement within safe bounds (avoids edge clipping) —
        // the contributor can drag it wherever they want right after.
        x: Math.round((15 + Math.random() * 70) * 10) / 10,
        y: Math.round((15 + Math.random() * 70) * 10) / 10,
        addedBy: req.user.id,
    });
    await album.save();
    await album.populate('pins.addedBy', 'userName avatarStyle');

    const newPin = album.pins[album.pins.length - 1];
    res.status(201).send({ message: 'Pinned to the board', data: serializePin(newPin, moment, req.user.id) });
};

const updatePinPosition = async (req, res) => {
    const moment = await findMomentOrThrow(req.params.slug);
    if (!isOwnerOrMember(moment, req.user.id)) {
        throw new AppError(403, 'Only the owner or a collaborator can rearrange this board');
    }

    const album = await Album.findOne({ momentId: moment._id });
    if (!album) throw new AppError(404, 'Album not found');
    if (!isOpenForContributions(moment, album)) {
        throw new AppError(400, 'This board is sealed and can no longer be rearranged.');
    }

    const pin = album.pins.id(req.params.pinId);
    if (!pin) throw new AppError(404, 'Pin not found');

    pin.x = req.body.x;
    pin.y = req.body.y;
    await album.save();

    res.status(200).send({ message: 'Pin moved', data: { _id: pin._id, x: pin.x, y: pin.y } });
};

const voteToDeletePin = async (req, res) => {
    const moment = await findMomentOrThrow(req.params.slug);
    if (!isOwnerOrMember(moment, req.user.id)) {
        throw new AppError(403, 'Only the owner or a collaborator can vote to remove a pin');
    }

    const album = await Album.findOne({ momentId: moment._id });
    if (!album) throw new AppError(404, 'Album not found');
    if (!isOpenForContributions(moment, album)) {
        throw new AppError(400, 'This board is sealed — pins can no longer be removed.');
    }

    const pin = album.pins.id(req.params.pinId);
    if (!pin) throw new AppError(404, 'Pin not found');

    const userId = req.user.id;
    if (!pin.pendingDelete) {
        // Proposing a removal counts as the proposer's own vote.
        pin.pendingDelete = { requestedBy: userId, requestedAt: new Date(), votes: [userId] };
    } else if (!pin.pendingDelete.votes.some((v) => v.toString() === userId)) {
        pin.pendingDelete.votes.push(userId);
    }

    const needed = requiredVotes(moment);
    if (pin.pendingDelete.votes.length >= needed) {
        await cloudinary.uploader.destroy(pin.publicId).catch((err) => console.error('Failed to delete pin image from Cloudinary:', err.message));
        pin.deleteOne();
        await album.save();
        return res.status(200).send({ message: 'Pin removed', data: { deleted: true } });
    }

    await album.save();
    res.status(200).send({
        message: 'Vote recorded',
        data: { deleted: false, currentVotes: pin.pendingDelete.votes.length, requiredVotes: needed },
    });
};

// Called from moment.controller.js's deleteMoment — a deleted moment must not
// leave its album (and its Cloudinary photos) behind forever.
const deleteAlbumForMoment = async (momentId) => {
    const album = await Album.findOneAndDelete({ momentId });
    if (!album) return;
    await Promise.all(
        album.pins.map((pin) =>
            cloudinary.uploader.destroy(pin.publicId).catch((err) => console.error(`Failed to delete album pin image ${pin.publicId}:`, err.message))
        )
    );
};

module.exports = { getAlbum, addPin, updatePinPosition, voteToDeletePin, deleteAlbumForMoment };
