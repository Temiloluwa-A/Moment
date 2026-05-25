const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using your environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

// Configure the storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'moment_backgrounds', // A folder in your Cloudinary account to store images
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit (in bytes)
        files: 1 // Maximum number of files allowed to be uploaded at once
    }
});

module.exports = { cloudinary, upload };