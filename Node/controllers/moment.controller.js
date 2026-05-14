const Timer = require('../model/timer.model');
const crypto = require('crypto');

const createMoment = async (req, res) => {
    try {
        const momentData = req.body;
        // Attach the userId extracted from the JWT token in the middleware
        momentData.userId = req.user.id;
        
        if (!momentData.slug) {
            momentData.slug = crypto.randomBytes(6).toString('hex');
        }

        const newMoment = await Timer.create(momentData);

        res.status(201).send({ message: "Moment saved successfully", data: newMoment });
    } catch (error) {
        console.log(error);
        // Send the exact Mongoose validation error to the frontend!
        res.status(500).send({ message: error.message || "Failed to save moment" });
    }
};

const getMoments = async (req, res) => {
    try {
        // Fetch moments where the user is the owner OR a collaborator (in the members array)
        // .sort({ createdAt: -1 }) ensures the newest moments appear first!
        const moments = await Timer.find({ $or: [{ userId: req.user.id }, { members: req.user.id }] }).sort({ createdAt: -1 });
        res.status(200).send({ message: "Moments fetched successfully", data: moments, currentUserId: req.user.id });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch moments" });
    }
};

const getPublicMoments = async (req, res) => {
    try {
        // Fetch all moments that are marked public.
        // .populate() fetches the linked User document so we can display their userName!
        const publicMoments = await Timer.find({ isPublic: true }).populate('userId', 'userName').sort({ createdAt: -1 });
        
        res.status(200).send({ message: "Public moments fetched successfully", data: publicMoments });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch public moments" });
    }
};

const deleteMoment = async (req, res) => {
    try {
        const momentId = req.params.id;
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
        const updateData = req.body;
        
        // Prevent MongoDB crash: We cannot update the immutable _id field!
        delete updateData._id;
        
        // Find the moment by ID & User, and apply the new data. 
        // { new: true } tells Mongoose to return the updated document!
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
        const moment = await Timer.findOne({ slug }).populate('userId', 'userName').populate('members', 'userName email avatarStyle avatarOptions');
        
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
        if (moment.members && moment.members.includes(userId)) {
            return res.status(400).send({ message: "You are already a member of this moment" });
        }

        // Add them to the members array!
        moment.members.push(userId);
        await moment.save();

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

module.exports = { createMoment, getMoments, getPublicMoments, deleteMoment, updateMoment, getSharedMoment, joinMoment, removeMember };