const { cloudinary } = require('../middleware/cloudinary');

// Shared by moment.controller.js and album.controller.js — both upload a
// multer in-memory buffer to Cloudinary the same way.
const uploadBufferToCloudinary = async (file, options = {}) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return await cloudinary.uploader.upload(dataUri, options);
};

module.exports = uploadBufferToCloudinary;
