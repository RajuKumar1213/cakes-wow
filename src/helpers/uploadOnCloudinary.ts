import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload file on cloudinary from file path (for localhost)
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    if (!response) return null;

    // after uploading on cloudinary delete/unlink the file
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the file upload operation on cloudinary got failed.
    return null;
  }
};

// upload file on cloudinary from buffer (for Vercel/serverless)
const uploadBufferToCloudinary = async (buffer: Buffer, filename: string) => {
  try {
    if (!buffer) return null;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `products/${filename}`,
          folder: 'bakingo-products',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Buffer upload error:', error);
    return null;
  }
};

// delete file on cloudinary
const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return null;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log('Error while deleting file from cloudinary', error);
    return null;
  }
};

export { uploadOnCloudinary, uploadBufferToCloudinary, deleteFromCloudinary };