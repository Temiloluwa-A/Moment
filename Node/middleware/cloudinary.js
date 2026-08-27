const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB max per file
    },
    fileFilter: (req, file, cb) => {
        const isBackgroundImage = file.fieldname === 'backgroundImage' && file.mimetype.startsWith('image/');
        const isGiftVideo = file.fieldname === 'giftVideo' && file.mimetype.startsWith('video/');
        if (isBackgroundImage || isGiftVideo) {
            return cb(null, true);
        }
        cb(new Error(`Invalid file type for ${file.fieldname}: expected ${file.fieldname === 'giftVideo' ? 'a video' : 'an image'}.`));
    },
});

module.exports = { cloudinary, upload };