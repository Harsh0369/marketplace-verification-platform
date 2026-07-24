import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

async function run() {
  try {
    const res = await fetch('https://picsum.photos/400/400.jpg');
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadStream = cloudinary.uploader.upload_stream(
      {},
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          process.exit(1);
        }
        console.log('Success:', result);
        process.exit(0);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Catch Error:', error);
  }
}

run();
