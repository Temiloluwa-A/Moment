const Timer = require('../model/timer.model');
const { Root } = require('../model/shared.model');
const User = require('../model/user.model');
const crypto = require('crypto');
const { cloudinary } = require('../middleware/cloudinary');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/AppError');
const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');
const { deleteAlbumForMoment } = require('./album.controller');
const { createMomentSchema, updateMomentSchema } = require('../validation/moment.validation');

// Fields the owner is actually allowed to change from the edit form. Keeps
// server-managed fields (userId, slug, rootCount, members, _id, ...) out of
// reach even though the request is scoped to a moment the caller owns.
const EDITABLE_MOMENT_FIELDS = ['title', 'mode', 'startAt', 'endAt', 'timeZone', 'units', 'isGift', 'isPublic', 'notify', 'customization'];

// Multer puts non-file multipart fields into req.body as strings — customization
// and units arrive JSON-stringified in that case, so parse them back into
// objects before validating/using them. Over a plain JSON request they're
// already objects and this is a no-op.
const parseJSONField = (value, fieldName) => {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        throw new AppError(400, `Invalid ${fieldName} JSON`);
    }
};

// Mirrors middleware/validate.js's message formatting — used here instead of
// that generic middleware because these two routes are multipart, not plain
// JSON, so validation has to happen inline after the JSON-field parsing above.
const parseOrThrow = (schema, data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new AppError(400, result.error.issues.map((issue) => issue.message).join(' '));
    }
    return result.data;
};

const createMoment = async (req, res) => {
    const momentData = req.body;
    momentData.customization = parseJSONField(momentData.customization, 'customization');
    momentData.units = parseJSONField(momentData.units, 'units');

    const parsed = parseOrThrow(createMomentSchema, momentData);
    parsed.userId = req.user.id;
    parsed.slug = crypto.randomBytes(6).toString('hex');

    const backgroundFile = req.files?.backgroundImage?.[0];
    const giftVideoFile = req.files?.giftVideo?.[0];

    if (backgroundFile && parsed.customization?.background?.type === 'image') {
        const uploadResult = await uploadBufferToCloudinary(backgroundFile, {
            folder: 'moment_backgrounds',
            resource_type: 'image',
        });
        parsed.customization.background.value = uploadResult.secure_url;
        parsed.customization.background.publicId = uploadResult.public_id;
    }

    if (giftVideoFile) {
        const uploadResult = await uploadBufferToCloudinary(giftVideoFile, {
            folder: 'moment_gift_videos',
            resource_type: 'video',
        });
        parsed.customization = parsed.customization || {};
        parsed.customization.trigger = parsed.customization.trigger || {};
        parsed.customization.trigger.media = {
            secure_url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: 'video',
        };
    }

    const newMoment = await Timer.create(parsed);

    res.status(201).send({ message: "Moment saved successfully", data: newMoment });
};

// Keeps listing responses bounded regardless of how many moments exist.
// Fetches one extra document to know whether another page exists without a
// separate count query.
const DEFAULT_PAGE_SIZE = 24;
const parsePagination = (req) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE));
    return { page, limit, skip: (page - 1) * limit };
};

const getMoments = async (req, res) => {
    const { page, limit, skip } = parsePagination(req);
    // Fetch moments where the user is the owner OR a collaborator (in the members array).
    // Excludes moments whose owner deleted their account — no one can manage
    // them anymore, so they're hidden rather than shown as a dead end.
    // .sort({ createdAt: -1 }) ensures the newest moments appear first!
    const moments = await Timer.find({ $or: [{ userId: req.user.id }, { members: req.user.id }], ownerDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1);
    const hasMore = moments.length > limit;
    res.status(200).send({
        message: "Moments fetched successfully",
        data: moments.slice(0, limit),
        currentUserId: req.user.id,
        page,
        hasMore,
    });
};

const getPublicMoments = async (req, res) => {
    const { page, limit, skip } = parsePagination(req);
    // Fetch moments that are marked public (the owner-deleted flag also forces
    // isPublic to false, so this filter alone keeps orphaned moments out —
    // the explicit check here is just defense in depth).
    // .populate() fetches the linked User document so we can display their userName!
    const publicMoments = await Timer.find({ isPublic: true, ownerDeleted: { $ne: true } })
        .populate('userId', 'userName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1);
    const hasMore = publicMoments.length > limit;
    res.status(200).send({
        message: "Public moments fetched successfully",
        data: publicMoments.slice(0, limit),
        page,
        hasMore,
    });
};

const deleteMoment = async (req, res) => {
    const momentId = req.params.id;

    // Before deleting, check if there's an image to delete from Cloudinary
    const momentToDelete = await Timer.findOne({ _id: momentId, userId: req.user.id });
    if (momentToDelete?.customization?.background?.publicId) {
        await cloudinary.uploader.destroy(momentToDelete.customization.background.publicId);
    }

    // Find the moment by ID and make sure it belongs to the logged-in user
    const deletedMoment = await Timer.findOneAndDelete({ _id: momentId, userId: req.user.id });

    if (!deletedMoment) {
        throw new AppError(404, "Moment not found or unauthorized")
    }

    await deleteAlbumForMoment(deletedMoment._id);

    res.status(200).send({ message: "Moment deleted successfully" });
};

const updateMoment = async (req, res) => {
    const momentId = req.params.id;
    // Whitelist first — this is what keeps server-managed fields (userId,
    // slug, rootCount, members, _id, ...) out of reach even though the
    // request is already scoped to a moment the caller owns. The zod schema
    // below only checks shape/type of what's already been whitelisted; it
    // does not itself strip unknown keys, so this order matters.
    const updateData = {};
    for (const key of EDITABLE_MOMENT_FIELDS) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    // When uploading files, other form fields are strings.
    updateData.customization = parseJSONField(updateData.customization, 'customization');
    updateData.units = parseJSONField(updateData.units, 'units');

    const parsed = parseOrThrow(updateMomentSchema, updateData);

    // Find the existing moment to check for an old image to delete
    const existingMoment = await Timer.findOne({ _id: momentId, userId: req.user.id });
    if (!existingMoment) {
        throw new AppError(404, "Moment not found or unauthorized")
    }

    const oldBackgroundPublicId = existingMoment.customization?.background?.publicId;
    const oldGiftPublicId = existingMoment.customization?.trigger?.media?.publicId;
    const backgroundFile = req.files?.backgroundImage?.[0];
    const giftVideoFile = req.files?.giftVideo?.[0];

    if (backgroundFile && parsed.customization?.background?.type === 'image') {
        if (oldBackgroundPublicId) {
            await cloudinary.uploader.destroy(oldBackgroundPublicId);
        }
        const uploadResult = await uploadBufferToCloudinary(backgroundFile, {
            folder: 'moment_backgrounds',
            resource_type: 'image',
        });
        parsed.customization.background.value = uploadResult.secure_url;
        parsed.customization.background.publicId = uploadResult.public_id;
    } else if (oldBackgroundPublicId && parsed.customization?.background?.type !== 'image') {
        await cloudinary.uploader.destroy(oldBackgroundPublicId);
        parsed['customization.background.publicId'] = null;
    }

    if (giftVideoFile) {
        if (oldGiftPublicId) {
            await cloudinary.uploader.destroy(oldGiftPublicId, { resource_type: 'video' });
        }
        const uploadResult = await uploadBufferToCloudinary(giftVideoFile, {
            folder: 'moment_gift_videos',
            resource_type: 'video',
        });
        parsed.customization = parsed.customization || {};
        parsed.customization.trigger = parsed.customization.trigger || {};
        parsed.customization.trigger.media = {
            secure_url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: 'video',
        };
    }

    const updatedMoment = await Timer.findOneAndUpdate({ _id: momentId, userId: req.user.id }, parsed, { new: true, runValidators: true });

    if (!updatedMoment) {
        throw new AppError(404, "Moment not found or unauthorized")
    }

    res.status(200).send({ message: "Moment updated successfully", data: updatedMoment });
};


const getSharedMoment = async (req, res) => {
    const slug = req.params.slug;
    // Removed isPublic: true so that anyone with the direct link can view and join!
    const moment = await Timer.findOne({ slug }).populate('userId', 'userName').populate('members', 'userName avatarStyle avatarOptions');

    if (!moment) {
        throw new AppError(404, "Shared moment not found")
    }

    res.status(200).send({ message: "Shared moment fetched successfully", data: moment });
}

const joinMoment = async (req, res) => {
    const slug = req.params.slug;
    const userId = req.user.id; // From authMiddleware

    const moment = await Timer.findOne({ slug });
    if (!moment) throw new AppError(404, "Moment not found")

    // Check if the user is the owner
    if (moment.userId.toString() === userId) {
        throw new AppError(400, "You are the owner of this moment")
    }
    // Check if they are already a member
    if (moment.members && moment.members.some(member => member.toString() === userId)) {
        throw new AppError(400, "You are already a member of this moment")
    }

    // Add them to the members array!
    moment.members = moment.members || [];
    moment.members.push(userId);
    await moment.save();

    // Best-effort: let the owner know someone joined. Never blocks the join itself.
    try {
        const [owner, joiner] = await Promise.all([
            User.findById(moment.userId).select('fullName email'),
            User.findById(userId).select('fullName userName'),
        ]);
        if (owner?.email) {
            const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
            const momentUrl = `${clientUrl}/moment/${moment.slug}`;
            const joinerName = joiner?.fullName || joiner?.userName || 'Someone';
            await sendEmail({
                to: owner.email,
                subject: `${joinerName} joined "${moment.title || 'your moment'}"`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E241A;">
                        <h2 style="font-style: italic; color: #A9631E;">Moment</h2>
                        <p>Hi ${owner.fullName || 'there'},</p>
                        <p><strong>${joinerName}</strong> just joined "<strong>${moment.title || 'your moment'}</strong>".</p>
                        <p style="text-align: center; margin: 32px 0;">
                            <a href="${momentUrl}" style="background: #A9631E; color: #F7EFE0; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">View your moment</a>
                        </p>
                    </div>
                `,
            });
        }
    } catch (mailErr) {
        console.error('Failed to send join notification email:', mailErr.message);
    }

    res.status(200).send({ message: "Successfully joined the moment", data: moment });
};

const removeMember = async (req, res) => {
    const { slug, memberId } = req.params;
    const userId = req.user.id;

    const moment = await Timer.findOne({ slug });
    if (!moment) throw new AppError(404, "Moment not found")

    // Check permissions: requester must be either the owner, or the member themselves
    if (moment.userId.toString() !== userId && userId !== memberId) {
        throw new AppError(403, "Not authorized to remove this member")
    }

    // Remove the member
    moment.members = moment.members.filter(id => id.toString() !== memberId);
    await moment.save();

    res.status(200).send({ message: "Member removed successfully" });
};

const toggleRoot = async (req, res) => {
    const { timerId } = req.params;
    const userId = req.user.id;

    // 1. Find the root document for this specific timer
    let rootDoc = await Root.findOne({ timerId });

    // 2. If the document doesn't exist yet, create it and add the first root
    if (!rootDoc) {
        rootDoc = await Root.create({
            timerId,
            users: [userId]
        });
        await Timer.findByIdAndUpdate(timerId, { rootCount: 1 });
        return res.status(200).send({
            message: "Successfully rooted!",
            rootCount: 1,
            rooted: true
        });
    }

    // 3. Check if the user's ID is already in the array
    const hasRooted = rootDoc.users.includes(userId);
    let rootCount;

    if (hasRooted) {
        // UNROOT: User is in the array, so we remove them
        rootDoc.users.pull(userId);
        await rootDoc.save();
        rootCount = rootDoc.users.length;
    } else {
        // ROOT: User is not in the array, so we add them
        rootDoc.users.push(userId);
        await rootDoc.save();
        rootCount = rootDoc.users.length;
    }

    await Timer.findByIdAndUpdate(timerId, { rootCount });

    return res.status(200).send({
        message: hasRooted ? "Unrooted moment." : "Successfully rooted!",
        rooted: !hasRooted,
        rootCount
    });
};

module.exports = { createMoment, getMoments, getPublicMoments, deleteMoment, updateMoment, getSharedMoment, joinMoment, removeMember, toggleRoot };