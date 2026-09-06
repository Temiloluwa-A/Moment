const express = require('express');
const router = express.Router();
const { getAlbum, addPin, updatePinPosition, voteToDeletePin } = require('../controllers/album.controller');
const authMiddleware = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth');
const validate = require('../middleware/validate');
const { upload } = require('../middleware/cloudinary');
const { pinPositionSchema } = require('../validation/album.validation');

router.get('/moments/:slug/album', optionalAuth, getAlbum);
router.post('/moments/:slug/album/pins', authMiddleware, upload.single('pinImage'), addPin);
router.patch('/moments/:slug/album/pins/:pinId/position', authMiddleware, validate(pinPositionSchema), updatePinPosition);
router.post('/moments/:slug/album/pins/:pinId/delete-vote', authMiddleware, voteToDeletePin);

module.exports = router;
