import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

async function test() {
  try {
    // 1x1 white pixel JPEG
    const base64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    const buffer = Buffer.from(base64, 'base64');
    
    console.log("Testing Cloudinary Background Removal...");
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'test_bg',
        background_removal: "cloudinary_ai"
      },
      (error, result) => {
        if (error) console.error("Cloudinary Error:", error);
        else console.log("Success:", result?.secure_url);
      }
    );
    
    import('streamifier').then(s => s.createReadStream(buffer).pipe(uploadStream));
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
