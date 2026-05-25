const express = require('express');
const router = express.Router();
const { createMoment, getMoments, getPublicMoments, deleteMoment, updateMoment, getSharedMoment, joinMoment, removeMember } = require('../controllers/moment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload } = require('../middleware/cloudinary');

router.post('/moments', authMiddleware, upload.single('backgroundImage'), createMoment);
router.get('/moments', authMiddleware, getMoments);
router.get('/moments/public', getPublicMoments);
router.delete('/moments/:id', authMiddleware, deleteMoment);
router.patch('/moments/:id', authMiddleware, upload.single('backgroundImage'), updateMoment);
router.get('/moments/shared/:slug', getSharedMoment); // New route for fetching shared moment by slug
router.post('/moments/:slug/join', authMiddleware, joinMoment); // Route for accepting collaboration
router.delete('/moments/:slug/members/:memberId', authMiddleware, removeMember); // Route for leaving/removing a member


// Route for uploading images/videos to Cloudinary
// router.post('/upload', authMiddleware, upload.single('media'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send({ message: "No file uploaded" });
//     }
//     // Cloudinary automatically attaches the secure URL to req.file.path
//     res.status(200).send({ message: "File uploaded successfully", url: req.file.path });
// });

module.exports = router;