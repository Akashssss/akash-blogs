
import cloudinary from './cloudinaryConfig.js'; // Ensure the path is correct




export const   deleteImageFromCloudinary = async (publicId) => {
    try { 
         console.log( "deleting image : " , publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log(`Image with public ID ${publicId} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting image with public ID ${publicId}:`, error);
        throw new Error('Failed to delete image from Cloudinary.');
    }
};