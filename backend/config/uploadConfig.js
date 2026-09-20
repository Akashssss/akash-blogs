// server/config/uploadConfig.js

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js'; // Note the `.js` extension

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog_banners',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});

const upload = multer({ storage: storage });

export default upload;
