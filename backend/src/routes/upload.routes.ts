import { Router, Request, Response } from 'express';
import { upload } from '../config/cloudinary';
import { authorize } from '../middlewares/role.middleware';
import { Roles } from '../constants/role.constant';

const router = Router();

// Endpoint for uploading an image
router.post('/image', authorize(Roles.MEMBER, Roles.CURATOR, Roles.ADMIN, Roles.SUPER_ADMIN), upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Cloudinary URL is in req.file.path
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url: req.file.path }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
