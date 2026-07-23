import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { AppError } from '../utils/error.util';
import streamifier from 'streamifier';

class CloudinaryProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
  }

  async uploadImage(buffer: Buffer, folder: string = 'listingshield'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new AppError('Failed to upload image to Cloudinary', 500));
          }
          if (!result) {
            return reject(new AppError('Failed to upload image to Cloudinary (no result)', 500));
          }
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}

export const cloudinaryProvider = new CloudinaryProvider();
