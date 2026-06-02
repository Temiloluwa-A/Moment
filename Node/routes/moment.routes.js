const express = require('express');
const router = express.Router();
const { createMoment, getMoments, getPublicMoments, deleteMoment, updateMoment, getSharedMoment, joinMoment, removeMember, toggleRoot } = require('../controllers/moment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload } = require('../middleware/cloudinary');

router.post('/moments', authMiddleware, upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'giftVideo', maxCount: 1 }
]), createMoment);
router.get('/moments', authMiddleware, getMoments);
router.get('/moments/public', getPublicMoments);
router.delete('/moments/:id', authMiddleware, deleteMoment);
router.patch('/moments/:id', authMiddleware, upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'giftVideo', maxCount: 1 }
]), updateMoment);
router.get('/moments/shared/:slug', getSharedMoment); // New route for fetching shared moment by slug
router.post('/moments/:slug/join', authMiddleware, joinMoment); // Route for accepting collaboration
router.delete('/moments/:slug/members/:memberId', authMiddleware, removeMember); // Route for leaving/removing a member
router.post('/moments/:timerId/root', authMiddleware, toggleRoot); // Route for toggling root status

// Route for uploading images/videos to Cloudinary
// router.post('/upload', authMiddleware, upload.single('media'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send({ message: "No file uploaded" });
//     }
//     // Cloudinary automatically attaches the secure URL to req.file.path
//     res.status(200).send({ message: "File uploaded successfully", url: req.file.path });
// });

module.exports = router;