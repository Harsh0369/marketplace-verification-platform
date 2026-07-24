import { Router } from 'express';
import multer from 'multer';
import { productController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';

import { AppError } from '../utils/error.util';

// Configure multer for memory storage (Azure Blob needs buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, JPEG, and PNG formats are allowed', 400));
    }
  }
});

const router = Router();

// Public routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected routes
router.use(requireAuth as any);
router.post('/', upload.array('images', 5), productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));
// We keep the old upload endpoint for compatibility or single uploads, but restrict it too
router.post('/:id/images', upload.single('image'), productController.uploadImage.bind(productController));

export default router;
