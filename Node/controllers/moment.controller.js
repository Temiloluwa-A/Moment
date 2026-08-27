const Timer = require('../model/timer.model');
const { Root, Shared } = require('../model/shared.model');
const User = require('../model/user.model');
const crypto = require('crypto');
const { cloudinary } = require('../middleware/cloudinary');
const sendEmail = require('../utils/sendEmail');

const uploadBufferToCloudinary = async (file, options = {}) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return await cloudinary.uploader.upload(dataUri, options);
};

// Fields the owner is actually allowed to change from the edit form. Keeps
// server-managed fields (userId, slug, rootCount, members, _id, ...) out of
// reach even though the request is scoped to a moment the caller owns.
const EDITABLE_MOMENT_FIELDS = ['title', 'mode', 'startAt', 'endAt', 'timeZone', 'units', 'isGift', 'isPublic', 'notify', 'customization'];

const createMoment = async (req, res) => {
    try {
        const momentData = req.body;
        momentData.userId = req.user.id;

        if (!momentData.slug) {
            momentData.slug = crypto.randomBytes(6).toString('hex');
        }

        if (momentData.customization && typeof momentData.customization === 'string') {
            momentData.customization = JSON.parse(momentData.customization);
        }
        if (momentData.units && typeof momentData.units === 'string') {
            momentData.units = JSON.parse(momentData.units);
        }

        const backgroundFile = req.files?.backgroundImage?.[0];
        const giftVideoFile = req.files?.giftVideo?.[0];

        if (backgroundFile && momentData.customization?.background?.type === 'image') {
            const uploadResult = await uploadBufferToCloudinary(backgroundFile, {
                folder: 'moment_backgrounds',
                resource_type: 'image',
            });
            momentData.customization.background.value = uploadResult.secure_url;
            momentData.customization.background.publicId = uploadResult.public_id;
        }

        if (giftVideoFile) {
            const uploadResult = await uploadBufferToCloudinary(giftVideoFile, {
                folder: 'moment_gift_videos',
                resource_type: 'video',
            });
            momentData.customization = momentData.customization || {};
            momentData.customization.trigger = momentData.customization.trigger || {};
            momentData.customization.trigger.media = {
                secure_url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                resourceType: 'video',
            };
        }

        const newMoment = await Timer.create(momentData);

        res.status(201).send({ message: "Moment saved successfully", data: newMoment });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message || "Failed to save moment" });
    }
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
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch moments" });
    }
};

const getPublicMoments = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch public moments" });
    }
};

const deleteMoment = async (req, res) => {
    try {
        const momentId = req.params.id;

        // Before deleting, check if there's an image to delete from Cloudinary
        const momentToDelete = await Timer.findOne({ _id: momentId, userId: req.user.id });
        if (momentToDelete?.customization?.background?.publicId) {
            await cloudinary.uploader.destroy(momentToDelete.customization.background.publicId);
        }

        // Find the moment by ID and make sure it belongs to the logged-in user
        const deletedMoment = await Timer.findOneAndDelete({ _id: momentId, userId: req.user.id });

        if (!deletedMoment) {
            return res.status(404).send({ message: "Moment not found or unauthorized" });
        }

        res.status(200).send({ message: "Moment deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete moment" });
    }
};

const updateMoment = async (req, res) => {
    try {
        const momentId = req.params.id;
        const updateData = {};
        for (const key of EDITABLE_MOMENT_FIELDS) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        }

        // When uploading files, other form fields are strings.
        if (updateData.customization && typeof updateData.customization === 'string') {
            updateData.customization = JSON.parse(updateData.customization);
        }
        if (updateData.units && typeof updateData.units === 'string') {
            updateData.units = JSON.parse(updateData.units);
        }

        // Find the existing moment to check for an old image to delete
        const existingMoment = await Timer.findOne({ _id: momentId, userId: req.user.id });
        if (!existingMoment) {
            return res.status(404).send({ message: "Moment not found or unauthorized" });
        }

        const oldBackgroundPublicId = existingMoment.customization?.background?.publicId;
        const oldGiftPublicId = existingMoment.customization?.trigger?.media?.publicId;
        const backgroundFile = req.files?.backgroundImage?.[0];
        const giftVideoFile = req.files?.giftVideo?.[0];

        if (backgroundFile && updateData.customization?.background?.type === 'image') {
            if (oldBackgroundPublicId) {
                await cloudinary.uploader.destroy(oldBackgroundPublicId);
            }
            const uploadResult = await uploadBufferToCloudinary(backgroundFile, {
                folder: 'moment_backgrounds',
                resource_type: 'image',
            });
            updateData.customization.background.value = uploadResult.secure_url;
            updateData.customization.background.publicId = uploadResult.public_id;
        } else if (oldBackgroundPublicId && updateData.customization?.background?.type !== 'image') {
            await cloudinary.uploader.destroy(oldBackgroundPublicId);
            updateData['customization.background.publicId'] = null;
        }

        if (giftVideoFile) {
            if (oldGiftPublicId) {
                await cloudinary.uploader.destroy(oldGiftPublicId, { resource_type: 'video' });
            }
            const uploadResult = await uploadBufferToCloudinary(giftVideoFile, {
                folder: 'moment_gift_videos',
                resource_type: 'video',
            });
            updateData.customization = updateData.customization || {};
            updateData.customization.trigger = updateData.customization.trigger || {};
            updateData.customization.trigger.media = {
                secure_url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                resourceType: 'video',
            };
        }

        const updatedMoment = await Timer.findOneAndUpdate({ _id: momentId, userId: req.user.id }, updateData, { new: true });

        if (!updatedMoment) {
            return res.status(404).send({ message: "Moment not found or unauthorized" });
        }

        res.status(200).send({ message: "Moment updated successfully", data: updatedMoment });
    } catch (error) {
        console.log(error);
        // Send the exact Mongoose validation error to the frontend!
        res.status(500).send({ message: error.message || "Failed to update moment" });
    }
};


const getSharedMoment = async (req, res) => {
    try {
        const slug = req.params.slug;
        // Removed isPublic: true so that anyone with the direct link can view and join!
        const moment = await Timer.findOne({ slug }).populate('userId', 'userName').populate('members', 'userName avatarStyle avatarOptions');

        if (!moment) {
            return res.status(404).send({ message: "Shared moment not found" });
        }

        res.status(200).send({ message: "Shared moment fetched successfully", data: moment });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch shared moment" });
    }
}

const joinMoment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const userId = req.user.id; // From authMiddleware

        const moment = await Timer.findOne({ slug });
        if (!moment) return res.status(404).send({ message: "Moment not found" });

        // Check if the user is the owner
        if (moment.userId.toString() === userId) {
            return res.status(400).send({ message: "You are the owner of this moment" });
        }
        // Check if they are already a member
        if (moment.members && moment.members.some(member => member.toString() === userId)) {
            return res.status(400).send({ message: "You are already a member of this moment" });
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
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to join moment" });
    }
};

const removeMember = async (req, res) => {
    try {
        const { slug, memberId } = req.params;
        const userId = req.user.id;

        const moment = await Timer.findOne({ slug });
        if (!moment) return res.status(404).send({ message: "Moment not found" });

        // Check permissions: requester must be either the owner, or the member themselves
        if (moment.userId.toString() !== userId && userId !== memberId) {
            return res.status(403).send({ message: "Not authorized to remove this member" });
        }

        // Remove the member
        moment.members = moment.members.filter(id => id.toString() !== memberId);
        await moment.save();

        res.status(200).send({ message: "Member removed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to remove member" });
    }
};

const toggleRoot = async (req, res) => {
    try {
        const { timerId } = req.params;
        const userId = req.user.id || req.user._id;

        // 1. Find the root document for this specific timer
        let rootDoc = await Root.findOne({ timerId });

        // 2. If the document doesn't exist yet, create it and add the first root
        if (!rootDoc) {
            rootDoc = await Root.create({
                timerId,
                users: [userId]
            });
            await Timer.findByIdAndUpdate(timerId, { rootCount: 1 });
            return res.status(200).json({
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

        return res.status(200).json({
            message: hasRooted ? "Unrooted moment." : "Successfully rooted!",
            rooted: !hasRooted,
            rootCount
        });

    } catch (error) {
        console.error("Error toggling root:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createMoment, getMoments, getPublicMoments, deleteMoment, updateMoment, getSharedMoment, joinMoment, removeMember, toggleRoot };