import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env.config';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary config is missing in .env. Uploads will fail.');
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'opportunity-radar',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  } as any,
});

export const upload = multer({ storage: storage });
